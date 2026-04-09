const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;
const Gio = imports.gi.Gio;

class TimerApplet extends Applet.TextApplet {

    constructor(metadata, orientation, panel_height, instance_id) {
        super(orientation, panel_height, instance_id);

        this._countdownId = null;
        this._remainingSeconds = 0;

        this.set_applet_label("⏱ --:--");
        this.set_applet_tooltip("Timer Applet");

        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        let setItem = new PopupMenu.PopupMenuItem("Set Timer");
        setItem.connect("activate", () => this._promptAndStart());
        this.menu.addMenuItem(setItem);

        let cancelItem = new PopupMenu.PopupMenuItem("Cancel Timer");
        cancelItem.connect("activate", () => this._cancelTimer());
        this.menu.addMenuItem(cancelItem);
    }

    on_applet_clicked() {
        this.menu.toggle();
    }

    //  Safe async Zenity dialog
    _promptAndStart() {
        this._cancelTimer();

        let proc = new Gio.Subprocess({
            argv: [
                "zenity", "--forms",
                "--title=Set Timer",
                "--text=Enter countdown time:",
                "--add-entry=Minutes",
                "--add-entry=Seconds"
            ],
            flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE
        });

        proc.init(null);
        proc.communicate_utf8_async(null, null, (proc, result) => {
            try {
                let [ok, stdout] = proc.communicate_utf8_finish(result);
                if (!ok || !stdout) return;

                let parts = stdout.trim().split("|");
                if (parts.length < 2) return;

                let minutes = parseInt(parts[0]) || 0;
                let seconds = parseInt(parts[1]) || 0;

                if (minutes === 0 && seconds === 0) return;

                this._startTimer(minutes, seconds);
            } catch (e) {
                global.logError(e);
            }
        });
    }

    _startTimer(minutes, seconds) {
        this._remainingSeconds = (minutes * 60) + seconds;

        this._updateLabel();

        this._countdownId = Mainloop.timeout_add_seconds(1, () => {
            this._remainingSeconds--;

            if (this._remainingSeconds <= 0) {
                this.set_applet_label("⏱ Done!");
                this._playSound();
                this._cleanup();
                return false;
            }

            this._updateLabel();
            return true;
        });
    }

    _updateLabel() {
        let m = Math.floor(this._remainingSeconds / 60);
        let s = this._remainingSeconds % 60;

        let display =
            String(m).padStart(2, "0") + ":" +
            String(s).padStart(2, "0");

        this.set_applet_label("⏱ " + display);
    }

    //  Non-blocking sound playback
    //_playSound() {
    //    try {
    //        let proc = new Gio.Subprocess({
    //            argv: ["canberra-gtk-play", "-i", "complete"],
    //            flags: Gio.SubprocessFlags.NONE
    //        });
    //
    //       proc.init(null); // harmless here, but optional
    //    } catch (e) {
    //        global.logError(e);
    //    }
    //}

_playSound() {
    let count = 0;

    let playOnce = () => {
        try {
            //new Gio.Subprocess({
            //    argv: [
            //        "paplay",
            //        "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga"
            //    ],
            //    flags: Gio.SubprocessFlags.NONE
            //});

            //proc.init(null);

            Util.spawnCommandLine("paplay /usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga");
        } catch (e) {
            global.logError(e);
        }

        count++;
        return count < 3; // repeat 3 times
    };

    // play immediately
    playOnce();

    // repeat every 2 seconds
    this._soundLoopId = Mainloop.timeout_add_seconds(2, playOnce);
}

    _cancelTimer() {
        this._cleanup();
        this.set_applet_label("⏱ --:--");
    }

    _cleanup() {
        if (this._countdownId) {
            Mainloop.source_remove(this._countdownId);
            this._countdownId = null;
        }
	if (this._soundLoopId) {
            Mainloop.source_remove(this._soundLoopId);
            this._soundLoopId = null;
	}
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new TimerApplet(metadata, orientation, panel_height, instance_id);
}
