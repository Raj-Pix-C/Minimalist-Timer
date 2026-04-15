# Timer Applet for Cinnamon

A lightweight countdown timer applet for the [Cinnamon desktop environment](https://github.com/linuxmint/Cinnamon). Set a timer in minutes and seconds directly from your panel — no extra windows, no dependencies beyond what ships with Linux Mint.

---

## Features

- Countdown timer accessible from the system panel
- Input via a simple dialog (minutes + seconds)
- Live display updating every second in the panel label
- Desktop notification when the timer finishes
- Cancel a running timer at any time

---

## Requirements

- Linux Mint with Cinnamon desktop
- `zenity` (pre-installed on most Linux Mint systems)

---

## Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/yourusername/timer-applet.git
   ```

2. Copy the applet folder to your Cinnamon applets directory:
   ```bash
   cp -r timer-applet ~/.local/share/cinnamon/applets/timer@yourusername
   ```

3. Right-click the Cinnamon panel → **Add applets to the panel** → find **Timer Applet** and add it.

> The applet UUID in the folder name must match the `uuid` field in `metadata.json`.

---

## Usage

- **Left-click** the panel label to open the menu.
- Select **Set Timer**, enter minutes and seconds in the dialog, and click OK.
- The panel label counts down in real time.
- A desktop notification fires when the timer reaches zero.
- Select **Cancel Timer** to stop a running timer at any time.

---

## Project Structure

```
timer-applet@user/
├── applet.js       # Main applet logic
├── metadata.json   # Applet metadata (uuid, name, version)
└── README.md
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
