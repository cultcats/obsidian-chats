import { MarkdownRenderChild } from "obsidian";

export class Dialog extends MarkdownRenderChild {
  text: string;
  speakerPreferences: Record<string, string> = {};

  constructor(containerEl: HTMLElement, text: string) {
    super(containerEl);
    this.text = text;
  }

  onload() {
    const lines = this.text.split("\n");
    const dialogContainer = this.containerEl.createEl("ul");
    dialogContainer.addClass("chat-dialog");

    lines.forEach(line => {
      const lineElement = this.createDialogLine(line);
      if (lineElement) dialogContainer.appendChild(lineElement);
    });

    this.containerEl.replaceWith(dialogContainer);
  }

  createDialogLine(text: string) {
    const { speaker, comment, statement, alignment } = this.dissectDialogLine(text);
    if (!speaker) return null;

    const dialogType = this.speakerPreferences[speaker.toLowerCase()] || alignment || "their-dialog";
    this.speakerPreferences[speaker.toLowerCase()] = dialogType; // Gem præferencen for fremtidig brug

    const line = document.createElement("li");
    line.classList.add(dialogType);
    const speakerElement = document.createElement("span");
    speakerElement.classList.add("dialog-speaker");
    speakerElement.textContent = speaker;

    const statementElement = document.createElement("p");
    statementElement.classList.add("dialog-statement");
    statementElement.textContent = statement;

    if (comment) {
      const metaElement = document.createElement("p");
      metaElement.classList.add("dialog-meta");
      const commentElement = document.createElement("span");
      commentElement.classList.add("dialog-comment");
      commentElement.textContent = comment;
      metaElement.appendChild(speakerElement);
      metaElement.appendChild(commentElement);
      line.appendChild(metaElement);
    } else {
      line.appendChild(speakerElement);
    }

    line.appendChild(statementElement);
    return line;
  }

  dissectDialogLine(line: string): { speaker: string; comment: string; statement: string; alignment: string } {
    let alignment = "their-dialog"; // Default alignment
    line = line.trim(); // Fjern whitespaces og tjek for specifikke tags
    let alignmentChar = line.match(/^\.([<>])/)?.[1];
    if (alignmentChar === "<") {
        alignment = "their-dialog";
        line = line.substring(2); // Fjerner navn og alignment marker
    } else if (alignmentChar === ">") {
        alignment = "my-dialog";
        line = line.substring(2); // Fjerner navn og alignment marker
    } else if (line.startsWith(".")) {
        alignment = "their-dialog"; // Default to their-dialog if no alignment marker is specified
        line = line.substring(1); // Fjerner kun navn
    }

    // Fortsætter med at ekstrahere taler, kommentar og udtalelse
    const regex = /^(\w+):(.*)/;
    const match = line.match(regex);
    if (match) {
        const [_, speaker, remainder] = match;
        const [comment, statement] = remainder.includes("(") ? remainder.split(/\((.*)\)/).map(str => str.trim()) : ["", remainder.trim()];
        return { speaker: speaker.trim(), comment, statement, alignment };
    }
    return { speaker: "", comment: "", statement: "", alignment };
  }
}
