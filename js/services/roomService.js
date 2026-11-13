
/* EduQuestAI Backend Room Service */

const save = (room) => {
    try {
        const rooms = JSON.parse(
            localStorage.getItem("eq_rooms") || "{}"
        );

        rooms[room.code] = room;

        localStorage.setItem("eq_rooms", JSON.stringify(rooms));
    } catch (error) {
        console.error("Could not cache room:", error);
    }
};

const svc = {
    async create(roomData) {
        // Wait for anonymous authentication
        const initializedSession = await authService.ready;

        if (!initializedSession) {
            throw new Error("Authentication is not ready.");
        }

        // Get the latest access token
        const { data, error } =
            await authService.client.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            throw new Error("No active anonymous session.");
        }

        // Send the request to our Express backend
        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify(roomData)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Could not create room."
            );
        }

        return result.room;
    },

    async join(code, nick) {
        // Wait for anonymous authentication
        const initializedSession = await authService.ready;

        if (!initializedSession) {
            throw new Error("Authentication is not ready.");
        }

        // Get the latest access token
        const { data, error } =
            await authService.client.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            throw new Error("No active anonymous session.");
        }

        // Send the join request to our Express backend
        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms/join`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    code,
                    nick
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Could not join room."
            );
        }

        return result.room;
    },
        async getRoom(code) {
        const initializedSession = await authService.ready;

        if (!initializedSession) {
            throw new Error("Authentication is not ready.");
        }

        const { data, error } =
            await authService.client.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            throw new Error("No active anonymous session.");
        }

        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms/${encodeURIComponent(code)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Could not retrieve room."
            );
        }

        return result.room;
    },

    async updateRole(code, role) {
        const initializedSession = await authService.ready;

        if (!initializedSession) {
            throw new Error("Authentication is not ready.");
        }

        const { data, error } =
            await authService.client.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            throw new Error("No active anonymous session.");
        }

        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms/${encodeURIComponent(code)}/role`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ role })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Could not update player role."
            );
        }

        return result.member;
    },

    async updateReady(code, isReady) {
    const session = await authService.ready;

    if (!session) {
        throw new Error("Authentication required.");
    }

    const response = await fetch(
        `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms/${encodeURIComponent(code)}/ready`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ isReady })
        }
    );

         const result = await response.json();

         if (!response.ok) {
             throw new Error(result.error || "Could not update ready status.");
         }

         return result.member;
    },


        async startRoom(code) {
        const initializedSession = await authService.ready;

        if (!initializedSession) {
            throw new Error("Authentication is not ready.");
        }

        const { data, error } =
            await authService.client.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            throw new Error("No active anonymous session.");
        }

        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms/${encodeURIComponent(code)}/start`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                }
            }
        );

        const raw = await response.text();

        let result;

        try {
            result = JSON.parse(raw);
        } catch {
            throw new Error(
                `Server returned non-JSON (HTTP ${response.status}): ${raw.slice(0, 200)}`
            );
        }

        if (!response.ok) {
            throw new Error(
                result.error || "Could not start adventure."
            );
        }

        return result.room;
    },


    async castVote(code, chapterId, optionId) {
        await authService.ready;

        const { data, error } =
            await authService.client.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            throw new Error("No active anonymous session.");
        }

        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms/${encodeURIComponent(code)}/vote`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ chapterId, optionId })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not submit vote.");
        }

        return result;
    },

    async getVotes(code, chapterId) {
        await authService.ready;

        const { data, error } =
            await authService.client.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            throw new Error("No active anonymous session.");
        }

        const response = await fetch(
            `${window.EDUQUEST_CONFIG.backendUrl}/api/rooms/${encodeURIComponent(code)}/votes/${encodeURIComponent(chapterId)}`,
            {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not retrieve votes.");
        }

        return result;
    }


};

window.EQRoomService = svc;