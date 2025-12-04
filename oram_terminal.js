/* ============================================================
   ORAM CRT TERMINAL RENDERER v1.2 (Hosted on Render)
   ============================================================ */

const ORAM_ENDPOINT = "https://robot-oram-server.onrender.com/oram";

class OramTerminal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.wrapper = document.createElement("div");
        this.wrapper.style.cssText = `
            font-family: "Courier New", monospace;
            background-color: #000;
            color: #00ff66;
            padding: 20px;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            overflow-y: auto;
            white-space: pre-wrap;
            line-height: 1.4;
            font-size: 16px;
        `;

        this.cursor = document.createElement("span");
        this.cursor.textContent = "█";
        this.cursor.style.cssText = `
            display: inline-block;
            color: #00ff66;
            margin-left: 2px;
        `;

        this.shadowRoot.appendChild(this.wrapper);

        this.buffer = "";
        this.currentInput = "";

        setInterval(() => {
            this.cursor.style.visibility =
                this.cursor.style.visibility === "hidden" ? "visible" : "hidden";
        }, 500);

        document.addEventListener("keydown", (ev) => this.handleKey(ev));
    }

    connectedCallback() {
        this.bootSequence();
    }

    async typeText(text, newline = true, charDelay = 18) {
        for (let i = 0; i < text.length; i++) {
            this.buffer += text[i];
            this.render();
            await this.sleep(charDelay);
        }

        if (newline) {
            this.buffer += "\n";
            this.render();
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async bootSequence() {
        await this.typeText(":: ORAM ACTIVE — Lorekeeper Node Online.", true, 22);
        await this.typeText(":: Awaiting input…");
        this.newPrompt();
    }

    render() {
        this.wrapper.textContent = this.buffer;
        this.wrapper.appendChild(this.cursor);
        this.wrapper.scrollTop = this.wrapper.scrollHeight;
    }

    newPrompt() {
        this.buffer += "\n> ";
        this.currentInput = "";
        this.render();
    }

    async handleKey(ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            const input = this.currentInput.trim();
            await this.handleSubmit(input);
            return;
        }

        if (ev.key === "Backspace") {
            ev.preventDefault();
            this.currentInput = this.currentInput.slice(0, -1);
            this.buffer = this.buffer.slice(0, -1);
            this.render();
            return;
        }

        if (ev.key.length === 1) {
            this.currentInput += ev.key;
            this.buffer += ev.key;
            this.render();
        }
    }

    async handleSubmit(text) {
        if (!text) {
            this.newPrompt();
            return;
        }

        this.buffer += "\n";
        this.render();

        let oramReply = ":: (No response)";

        try {
            const response = await fetch(ORAM_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            oramReply = ":: " + (data.reply || "(No content returned)");
        } catch (err) {
            oramReply = ":: [Error contacting ORAM]";
        }

        await this.typeText(oramReply);
        this.newPrompt();
    }
}

customElements.define("oram-terminal", OramTerminal);
