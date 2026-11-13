
/* ROOM LOBBY: scene, party panel, dialogue, ready/start, invite, settings */

// Character names and available player roles
const NM = [
    'Aria', 'Bram', 'Cael', 'Dara', 'Eli',
    'Fenn', 'Gwen', 'Hale', 'Iris', 'Jory',
    'Kira', 'Lio', 'Mara', 'Nox', 'Orin',
    'Pia', 'Quin', 'Rhea', 'Sol', 'Tess',
    'Uma', 'Vex', 'Wren', 'Yara', 'Zed'
];

const RK = ['swordsman', 'mage', 'archer', 'support'];

// Lobby dialogue
const INTRO = [
    'Welcome, adventurers! Your journey is about to begin. Gather your companions, choose your role, and prepare for the unknown.',
    'Every role matters here. The Swordsman guards, the Mage seeks, the Archer scouts, and the Healer mends.',
    'When all of you are ready, the host may open the gate to the adventure.'
];

// Display animated dialogue
function say(text, speaker) {
    const box = $('.ldb');

    box.classList.remove('pulse');
    void box.offsetWidth;
    box.classList.add('pulse');

    $('#dsp').textContent = speaker || 'GUILD MASTER';

    clearInterval(lb.tm);

    let i = 0;

    $('#dtx').textContent = '';

    lb.tm = setInterval(() => {
        $('#dtx').textContent = text.slice(0, ++i);

        if (i >= text.length) {
            clearInterval(lb.tm);
        }
    }, 20);
}

// Dungeon Master introduction
const DM_INTRO =
    'Welcome, Dungeon Master! Your students are gathering. Review the party, then begin the adventure once everyone is ready.';

// Check whether all players are ready and have selected a role
const allReady = () => {
    const students = room.players.filter(player => !player.dm);

    return (
        students.length >= room.min &&
        students.every(player => player.ready && player.role)
    );
};

// Configure lobby controls according to the user's role
function applyRole() {
    const dm = !!me.dm;

    $('#sg').style.display = can('settings') ? '' : 'none';
    $('#bst').style.display = can('start') ? '' : 'none';
    $('#tpb').style.display = can('teacherPanel') ? '' : 'none';
    $('#bch').style.display = can('chooseRole') ? '' : 'none';
    $('#brd').style.display = can('ready') ? '' : 'none';

    $('#tcp').classList.remove('open');
}

// Synchronize lobby information with the backend

async function syncRoom() {
    if (!room || lb.syncing) return;

    const roomCode = room.code;

    lb.syncing = true;

    try {
        const updatedRoom = await svc.getRoom(roomCode);

        if (!room || room.code !== roomCode) return;

        const currentPlayer = updatedRoom.players.find(
            player => player.userId === me.userId
        );

        if (!currentPlayer) return;

        room = updatedRoom;
        me = currentPlayer;

        render();

        // Automatically enter when the Dungeon Master starts
        if (
        updatedRoom.status === 'active' &&
        !me.dm &&
        !lb.gameLaunched
    ) {
        lb.gameLaunched = true;

        await EQGame.startPublished(
        updatedRoom.subject || 'Mathematics',
        updatedRoom.code
);
    }

    } catch (error) {
        console.error('Lobby synchronization failed:', error);

    } finally {
        lb.syncing = false;
    }
}

// Enter the room using actual backend members
async function enter(r, nick, host) {
    close();

    room = r;

    // Remember the active room for page restoration
    localStorage.setItem('eq_active_room', r.code);

    // Use the members returned by the backend
    room.players = room.players || [];

    // Identify the current user using their Supabase ID
    const { data, error } =
        await authService.client.auth.getSession();

    if (error) throw error;

    const currentUserId = data.session?.user?.id;

    const currentPlayer = room.players.find(
        player => player.userId === currentUserId
    );

    // Keep the actual player object, not a copy
    me = currentPlayer || {
        userId: currentUserId,
        name: nick,
        role: null,
        ready: false,
        host: false,
        dm: false
    };

    room.min = room.min || (host ? 1 : 2);

    // Stop any previous lobby synchronization
    clearInterval(lb.iv);

    // Initialize lobby state
    lb = {
        i: 0,
        n: 0,
        syncing: false,
        gameLaunched: false
    };

    // Switch from homepage to lobby
    $('#home').style.display = 'none';
    $('#lobby').style.display = 'flex';
    $('#nav').style.display = 'none';

    scrollTo(0, 0);

    $('#ldr').classList.toggle('open', innerWidth > 1000);

    applyRole();

    // Display introduction and render actual members
    say(me.dm ? DM_INTRO : INTRO[0]);

    render();
    renderTeacher();

    // Refresh lobby information every 3 seconds
    lb.iv = setInterval(syncRoom, 3000);

    // Allow players without a role to select one
    if (!me.dm && !me.role) {
        setTimeout(openSel, 150);
    }
}

// Render lobby members and player information
function render() {
    const P = room.players;
    const S = P.filter(player => !player.dm);
    const n = S.length;

    $('#lrn').textContent = room.name;
    $('#lrc').textContent = 'Room Code: ' + room.code;
    $('#lrp').textContent = n + ' / ' + room.max + ' PLAYERS';
    $('#pcn').textContent = n;

    $('#ldc').textContent =
        n + ' / ' + room.max + ' Players Joined · ' +
        S.filter(player => player.ready).length + ' ready';

    // Select players to display in the party preview
    const shownPlayers = [
        me,
        ...P.filter(player => player !== me && player.role)
    ]
        .filter(player => player.role)
        .slice(0, innerWidth < 700 ? 3 : 5);

    const extraPlayers = n - shownPlayers.length;

    $('#lsc').innerHTML =
        shownPlayers.map(player => `
            <div class="lch${player === me ? ' me' : ''}${player.ready ? ' rdy' : ''}">
                <div class="fr">
                    <img src="${IMG[player.role]}" alt="">
                </div>

                <div class="plat"></div>

                <b>${esc(player.name)}</b>

                <small>
                    ${hn(player.role).n} ·
                    ${player.ready ? '✔ Ready' : 'Not ready'}
                </small>
            </div>
        `).join('') +

        (extraPlayers > 0 ? `
            <div class="lch more" id="mr">
                +${extraPlayers}
                <small>more adventurers</small>
            </div>
        ` : '');

    // Expand party panel when extra players are clicked
    const moreButton = $('#mr');

    if (moreButton) {
        moreButton.onclick = () => {
            $('#ldr').classList.add('open');
        };
    }

    // Render complete player list
    $('#llist').innerHTML = [...P]
        .filter(player =>
            player.name.toLowerCase().includes(
                $('#lq').value.toLowerCase()
            )
        )
        .sort((a, b) =>
            (b.host ? 1 : 0) - (a.host ? 1 : 0)
        )
        .map(player => `
            <div class="lp">
                <div class="la">
                    ${
                        player.role
                            ? `<img src="${IMG[player.role]}" alt="">`
                            : player.dm ? '👑' : '?'
                    }
                </div>

                <div>
                    <b>${esc(player.name)}</b>
                    ${player.host ? ' 👑' : ''}
                    ${player === me ? ' (you)' : ''}

                    <small>
                        ${
                            player.dm
                                ? 'Dungeon Master'
                                : player.role
                                    ? hn(player.role).n
                                    : 'No role yet'
                        }
                    </small>
                </div>

                <span>
                    ${player.ready ? '✔ Ready' : '…'}
                </span>

                ${
                    me.dm && !player.dm
                        ? `<button class="kick" data-n="${esc(player.name)}" title="Remove">✕</button>`
                        : ''
                }
            </div>
        `).join('');

    // Update ready and start buttons
    $('#brd').textContent = me.ready ? 'NOT READY' : 'READY';

    $('#bst').disabled = !allReady();

    $('#bst').title = allReady()
        ? ''
        : 'All players must choose a role and be ready';

    $('#bst').classList.toggle('glow', allReady());

    // Update dialogue panel height
    $('#lobby').style.setProperty(
        '--dbh',
        ($('.ldb').offsetHeight + 14) + 'px'
    );

    if (me.dm) {
        renderTeacher();
    }
}

// Ready button
$('#brd').onclick = async () => {
    if (!me.role) {
        toast('Choose a role first');
        return openSel();
    }

    const newReadyStatus = !me.ready;

    $('#brd').disabled = true;

    try {
        const member = await svc.updateReady(
            room.code,
            newReadyStatus
        );

        me.ready = member.is_ready;

        if (me.ready) {
            say(me.name + ' is ready for the journey!');
        } else {
            say(me.name + ' needs a little more time.');
        }

        render();

    } catch (error) {
        console.error('Ready status update failed:', error);
        toast(error.message || 'Could not update ready status.');
    } finally {
        $('#brd').disabled = false;
    }
};

// Start adventure button (Dungeon Master only)
$('#bst').onclick = async () => {
    if (!me || !me.dm) {
        return toast('Only the Dungeon Master can start the adventure.');
    }

    if (!allReady()) {
        return toast('Everyone needs a role and must be ready');
    }

    $('#bst').disabled = true;

    try {
        await svc.startRoom(room.code);

        toast('Adventure started! Players are entering now.');

    } catch (error) {
        console.error('Adventure start failed:', error);

        toast(error.message || 'Could not start the adventure.');

    } finally {
        $('#bst').disabled = false;
    }
};

// Toggle party panel
$('#pt').onclick = () => {
    $('#ldr').classList.toggle('open');
};

$('#ldx').onclick = () => {
    $('#ldr').classList.remove('open');
};

// Open invitation modal
$('#iv').onclick = () => {
    $('#ivc').value = room.code;
    $('#ivl').value = 'https://eduquest.app/join/' + room.code;

    open('invm');
};

// Copy invitation code and link
$('#ivcb').onclick = e => {
    cp($('#ivc').value, e.target);
};

$('#ivlb').onclick = e => {
    cp($('#ivl').value, e.target);
};

// Open room settings
$('#sg').onclick = () => {
    $('#srn').value = room.name;
    $('#smn').value = room.min;

    open('setm');
};

// Save room settings locally
$('#ssv').onclick = () => {
    room.name = $('#srn').value.trim() || room.name;
    room.min = +$('#smn').value;

    close();

    render();

    toast('Room settings saved');
};

// Leave lobby
$('#llv').onclick = () => {
    clearInterval(lb.iv);

    room = null;

    // Forget the active room when intentionally leaving
    localStorage.removeItem('eq_active_room');

    $('#lobby').style.display = 'none';
    $('#home').style.display = '';
    $('#nav').style.display = '';

    $('#nav').classList.remove('s');

    scrollTo(0, 0);
};

// Re-render when window size changes
addEventListener('resize', () => {
    if (room && $('#lobby').style.display === 'flex') {
        render();
    }
});

// Player search
$('#lq').oninput = () => {
    if (room) render();
};

// Copy room code and invitation link
$('#lrc').onclick = () => cp(room.code, $('#lrc'));

$('#ccd').onclick = () => cp(room.code, $('#ccd'));

$('#cli').onclick = () => {
    cp(
        'https://eduquest.app/join/' + room.code,
        $('#cli')
    );
};
