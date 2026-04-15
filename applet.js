const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;

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
                Main.notify("Times Up!");
                this._cleanup();
                this._cancelTimer();
                return false;
            }

            this._updateLabel();
            return true;
        });
    }

    _updateLabel() {
        let m = Math.floor(this._remainingSeconds / 60);
        let s = this._remainingSeconds % 60;
        this.set_applet_label("⏱ " + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"));
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
    }
}

function main(metadata, orientation, panel_height, instance_id) {
    return new TimerApplet(metadata, orientation, panel_height, instance_id);
}
