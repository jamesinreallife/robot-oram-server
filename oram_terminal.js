/* ============================================================
   ORAM CRT TERMINAL RENDERER v1.3 (Hosted on Render)
   - Fixed scrolling
   - Stable height inside Wix Studio
   ============================================================ */

const ORAM_ENDPOINT = "https://robot-oram-server.onrender.com/oram";

class OramTerminal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // MAIN WRAPPER (scrolls internally)
        this.wrapper = document.createElement("div");
        this.wrapper.style.cssText = `
            font-family: "Courier New", monospace;
            background-color: #000;
            color: #00ff66;
            padding: 20px;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            white-space: pre-wrap;
            line-height: 1.4;
            font-size: 16px;
        `;

        // CURSOR
        this.cursor = document.createElement("span");
        this.cursor.textContent = "█";
        this.cursor.style.cssText = `
            display: inline-block;
            color: #00ff66;
            margin-left: 2px;
        `;

        this.shadowRoot.appendChild(this.wrapper);

        // INTERNAL BUFFERS
        this.buffer = "";
        this.currentInput = "";

        // CURSOR BLINK
        setInterval(() => {
            this.cursor.style.visibility =
                this.cursor.style.visibility === "hidden" ? "visible" : "hidden";
        }, 500);

        // KEY HANDLER
        document.addEventListener("keydown", (ev) => this.handleKey(ev));
    }

    connectedCallback() {
        this.bootSequence();
    }

    /* ------------------------------------------------------------
       TYPEWRITER EFFECT
       ------------------------------------------------------------ */
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

    /* ------------------------------------------------------------
       BOOT SEQUENCE
       ------------------------------------------------------------ */
    async bootSequence() {
        await this.typeText(":: ORAM ACTIVE — Lorekeeper Node Online.", true, 22);
        await this.typeText(":: Awaiting input…");
        this.newPrompt();
    }

    /* ------------------------------------------------------------
       RENDER OUTPUT + CURSOR
       ------------------------------------------------------------ */
    render() {
        this.wrapper.textContent = this.buffer;
        this.wrapper.appendChild(this.cursor);
        this.wrapper.scrollTop = this.wrapper.scrollHeight;  // AUTO-SCROLL
    }

    /* ------------------------------------------------------------
       NEW INPUT PROMPT
       ------------------------------------------------------------ */
    newPrompt() {
        this.buffer += "\n> ";
        this.currentInput = "";
        this.render();
    }

    /* ------------------------------------------------------------
       KEY INPUT HANDLER
       ------------------------------------------------------------ */
    async handleKey(ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            const input = this.currentInput.trim();
            await this.handleSubmit(input);
            return;
        }

        if (ev.key === "Backspace") {
            ev.preventDefault();
            if (this.currentInput.length > 0) {
                this.currentInput = this.currentInput.slice(0, -1);
                this.buffer = this.buffer.slice(0, -1);
                this.render();
            }
            return;
        }

        if (ev.key.length === 1) {
            this.currentInput += ev.key;
            this.buffer += ev.key;
            this.render();
        }
    }

    /* ------------------------------------------------------------
       SUBMIT → ORAM ENDPOINT
       ------------------------------------------------------------ */
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
