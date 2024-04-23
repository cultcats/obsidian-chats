import { Plugin } from 'obsidian';
import { Dialog } from "./dialogs";

interface Settings {
    // Settings should be defined here, if there are any
}

export default class Chats extends Plugin {
    settings: Settings;

    async onload() {
        await this.loadSettings();
        this.registerMarkdownPostProcessors();
    }

    registerMarkdownPostProcessors() {
        this.registerMarkdownPostProcessor((element, context) => {
            const elements = Array.from(element.querySelectorAll("p, hr"));

            elements.forEach((element) => {
                let text: string;
                if (element.tagName === "HR") {
                    text = "---";
                } else if (element.tagName === "P") {
                    text = (element as HTMLElement).innerText.trim();
                }

                const isDialog = text.startsWith(".") && text.includes(":");

                if (isDialog) {
                    context.addChild(new Dialog((element as HTMLElement), text));
                }
            });
        });
    }

    async loadSettings() {
        // Implement settings loading logic
    }

    onunload() {
        // Implement cleanup logic
    }
}
