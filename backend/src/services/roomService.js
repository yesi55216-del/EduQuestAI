
const adminSupabase = require("../config/adminSupabase");
const crypto = require("crypto");

const roomService = {
    generateRoomCode() {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        let code = "EQ";

        for (let i = 0; i < 6; i++) {
            const index = crypto.randomInt(characters.length);
            code += characters[index];
        }

        return code;
    },

    async createRoom(userId, roomData) {
        const {
            name,
            nick,
            max,
            min,
            level,
            subject,
            chapter,
            chapterTitle,
            mode,
            objectives
        } = roomData;

        let room = null;

        // Generate a unique room code
        for (let attempt = 0; attempt < 5; attempt++) {
            const code = this.generateRoomCode();

            const { data, error } = await adminSupabase
                .from("rooms")
                .insert({
                    code,
                    name,
                    created_by: userId,
                    max_players: max,
                    min_players: min,
                    level,
                    subject,
                    chapter,
                    chapter_title: chapterTitle,
                    mode,
                    objectives
                })
                .select()
                .single();

            if (!error) {
                room = data;
                break;
            }

            // Retry only if the room code already exists
            if (error.code !== "23505") {
                throw error;
            }
        }

        if (!room) {
            throw new Error("Could not generate a unique room code.");
        }

        // Add the teacher as the room host
        const { data: member, error: memberError } =
            await adminSupabase
                .from("room_members")
                .insert({
                    room_id: room.id,
                    user_id: userId,
                    display_name: nick,
                    is_host: true,
                    is_ready: true
                })
                .select()
                .single();

        if (memberError) {
            // Remove the room if host membership creation fails
            await adminSupabase
                .from("rooms")
                .delete()
                .eq("id", room.id);

            throw memberError;
        }

        return {
            ...room,

            // Frontend-compatible properties
            max: room.max_players,
            min: room.min_players,
            chapterTitle: room.chapter_title,

            // Host information
            players: [{
            userId: member.user_id,
            name: member.display_name,
            role: null,
            ready: member.is_ready,
            host: member.is_host,
            dm: true
            }]
        };
    },

    async joinRoom(userId, code, nick) {
        // Find the room
        const { data: room, error: roomError } =
            await adminSupabase
                .from("rooms")
                .select("*")
                .eq("code", code.toUpperCase().trim())
                .maybeSingle();

        if (roomError) throw roomError;

        if (!room) {
            throw new Error("ROOM_NOT_FOUND");
        }

        if (room.status !== "waiting") {
            throw new Error("ROOM_NOT_AVAILABLE");
        }

        // Check whether this user has already joined
        const { data: existingMember, error: memberError } =
            await adminSupabase
                .from("room_members")
                .select("*")
                .eq("room_id", room.id)
                .eq("user_id", userId)
                .maybeSingle();

        if (memberError) throw memberError;

        // Only insert a new membership if one doesn't already exist
        if (!existingMember) {
            // Count current room members
            const { count, error: countError } =
                await adminSupabase
                    .from("room_members")
                    .select("*", {
                        count: "exact",
                        head: true
                    })
                    .eq("room_id", room.id);

            if (countError) throw countError;

            if (count >= room.max_players) {
                throw new Error("ROOM_FULL");
            }

            // Register the player
            const { error: joinError } =
                await adminSupabase
                    .from("room_members")
                    .insert({
                        room_id: room.id,
                        user_id: userId,
                        display_name: nick,
                        is_host: false,
                        is_ready: false
                    });

            if (joinError) throw joinError;
        }

        // Retrieve all room members
        const { data: members, error: membersError } =
            await adminSupabase
                .from("room_members")
                .select("*")
                .eq("room_id", room.id)
                .order("joined_at", { ascending: true });

        if (membersError) throw membersError;

        return {
            ...room,

            // Frontend-compatible properties
            max: room.max_players,
            min: room.min_players,
            chapterTitle: room.chapter_title,

            // All actual room members
            players: members.map(member => ({
            userId: member.user_id,
            name: member.display_name,
            role: member.role,
            ready: member.is_ready,
            host: member.is_host,
            dm: member.is_host
            }))
        };
    },
        async getRoomForUser(userId, code) {
        // Find the room
        const { data: room, error: roomError } =
            await adminSupabase
                .from("rooms")
                .select("*")
                .eq("code", code.toUpperCase().trim())
                .maybeSingle();

        if (roomError) throw roomError;

        if (!room) {
            throw new Error("ROOM_NOT_FOUND");
        }

        // Verify that this user belongs to the room
        const { data: membership, error: membershipError } =
            await adminSupabase
                .from("room_members")
                .select("*")
                .eq("room_id", room.id)
                .eq("user_id", userId)
                .maybeSingle();

        if (membershipError) throw membershipError;

        if (!membership) {
            throw new Error("ROOM_ACCESS_DENIED");
        }

        // Retrieve all room members
        const { data: members, error: membersError } =
            await adminSupabase
                .from("room_members")
                .select("*")
                .eq("room_id", room.id)
                .order("joined_at", { ascending: true });

        if (membersError) throw membersError;

        return {
            ...room,
            max: room.max_players,
            min: room.min_players,
            chapterTitle: room.chapter_title,

            players: members.map(member => ({
                userId: member.user_id,
                name: member.display_name,
                role: member.role,
                ready: member.is_ready,
                host: member.is_host,
                dm: member.is_host
            }))
        };
        },

    async updatePlayerRole(userId, code, role) {
        // Find the room
        const { data: room, error: roomError } =
            await adminSupabase
                .from("rooms")
                .select("id")
                .eq("code", code.toUpperCase().trim())
                .maybeSingle();

        if (roomError) throw roomError;

        if (!room) {
            throw new Error("ROOM_NOT_FOUND");
        }

        // Update the role of this player
        const { data: member, error: updateError } =
            await adminSupabase
                .from("room_members")
                .update({
                    role,
                    is_ready: false
                })
                .eq("room_id", room.id)
                .eq("user_id", userId)
                .eq("is_host", false)
                .select()
                .maybeSingle();

        if (updateError) throw updateError;

        if (!member) {
            throw new Error("ROOM_MEMBER_NOT_FOUND");
        }

        return member;
    },

    async updatePlayerReady(userId, code, isReady) {
    const { data: room, error: roomError } = await adminSupabase
        .from("rooms")
        .select("id")
        .eq("code", code.toUpperCase().trim())
        .single();

    if (roomError || !room) {
        throw new Error("ROOM_NOT_FOUND");
    }

    const { data: member, error: memberError } = await adminSupabase
        .from("room_members")
        .update({ is_ready: isReady })
        .eq("room_id", room.id)
        .eq("user_id", userId)
        .eq("is_host", false)
        .select()
        .maybeSingle();

    if (memberError) throw memberError;

    if (!member) {
        throw new Error("ROOM_MEMBER_NOT_FOUND");
    }

    return member;
},

async startRoom(userId, code) {
    const { data: room, error: roomError } = await adminSupabase
        .from("rooms")
        .select("id, status")
        .eq("code", code.toUpperCase().trim())
        .single();

    if (roomError || !room) {
        throw new Error("ROOM_NOT_FOUND");
    }

    const { data: host, error: hostError } = await adminSupabase
        .from("room_members")
        .select("is_host")
        .eq("room_id", room.id)
        .eq("user_id", userId)
        .single();

    if (hostError || !host || !host.is_host) {
        throw new Error("HOST_ONLY");
    }

    const { data: updatedRoom, error: updateError } = await adminSupabase
        .from("rooms")
        .update({
            status: "active",
            game_state: { started: true, startedAt: new Date().toISOString() }
        })
        .eq("id", room.id)
        .select()
        .single();

    if (updateError) throw updateError;

    return updatedRoom;
},


    async castVote(userId, code, chapterId, optionId) {
        const room = await this.getRoomForUser(userId, code);

        if (room.status !== "active") {
            throw new Error("ROOM_NOT_ACTIVE");
        }

        const member = room.players.find(
            player => player.userId === userId
        );

        if (!member || member.host) {
            throw new Error("PLAYERS_ONLY");
        }

        if (!chapterId || !optionId) {
            throw new Error("INVALID_VOTE");
        }

        const { error } = await adminSupabase
            .from("room_votes")
            .upsert({
                room_id: room.id,
                user_id: userId,
                chapter_id: chapterId,
                option_id: optionId
            }, {
                onConflict: "room_id,user_id,chapter_id"
            });

        if (error) throw error;

        return { success: true };
    },

    async getVotes(userId, code, chapterId) {
        const room = await this.getRoomForUser(userId, code);

        if (!chapterId) {
            throw new Error("INVALID_VOTE");
        }

        const { data: members, error: membersError } =
            await adminSupabase
                .from("room_members")
                .select("user_id")
                .eq("room_id", room.id)
                .eq("is_host", false);

        if (membersError) throw membersError;

        const { data: votes, error: votesError } =
            await adminSupabase
                .from("room_votes")
                .select("user_id, option_id")
                .eq("room_id", room.id)
                .eq("chapter_id", chapterId);

        if (votesError) throw votesError;

        const counts = {};

        votes.forEach(vote => {
            counts[vote.option_id] =
                (counts[vote.option_id] || 0) + 1;
        });

        return {
            counts,
            totalVotes: votes.length,
            totalPlayers: members.length,
            myVote: votes.find(
                vote => vote.user_id === userId
            )?.option_id || null
        };
    },
    
};

module.exports = roomService;
