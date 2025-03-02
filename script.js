document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("animationCanvas");
    const ctx = canvas.getContext("2d");
    const codeEditor = document.querySelector(".code-editor");
    const playButton = document.querySelector(".play");
    
    canvas.width = 160;
    canvas.height = 90;

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;

        for (let x = 0; x <= canvas.width; x += 10) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= canvas.height; y += 10) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function parseAnimationCode(code) {
        let commands = [];
        let lines = code.split(";\n");
        lines.forEach(line => {
            line = line.trim();
            let match;
            let conditionMatch = line.match(/\{(.+?)\}\*/);
            let condition = null;
            if (conditionMatch) {
                condition = conditionMatch[1].trim();
                line = line.replace(/\{(.+?)\}\*/, "").trim();
            }

            if (line.startsWith("move(")) {
                match = line.match(/move\(([^)]+)\)/);
                if (match) {
                    let params = match[1].split(",").map(p => p.trim());
                    commands.push({ type: "move", obj: params[0], x: parseFloat(params[1].split(":")[1]), y: parseFloat(params[2].split(":")[1]), duration: parseFloat(params[3].split(":")[1]), condition });
                }
            } else if (line.startsWith("scaleMove(")) {
                match = line.match(/scaleMove\(([^)]+)\)/);
                if (match) {
                    let params = match[1].split(",").map(p => p.trim());
                    commands.push({ type: "scaleMove", obj: params[0], x: parseFloat(params[1].split(":")[1]), y: parseFloat(params[2].split(":")[1]), scale: parseFloat(params[3].split(":")[1]), duration: parseFloat(params[4].split(":")[1]), condition });
                }
            } else if (line.startsWith("fadeMove(")) {
                match = line.match(/fadeMove\(([^)]+)\)/);
                if (match) {
                    let params = match[1].split(",").map(p => p.trim());
                    commands.push({ type: "fadeMove", obj: params[0], x: parseFloat(params[1].split(":")[1]), y: parseFloat(params[2].split(":")[1]), opacity: parseFloat(params[3].split(":")[1]), duration: parseFloat(params[4].split(":")[1]), condition });
                }
            }
        });
        return commands;
    }

    function executeCommands(commands) {
        commands.forEach(cmd => {
            if (cmd.type === "move") {
                ctx.fillStyle = "red";
                ctx.fillRect(cmd.x * 10, cmd.y * 10, 5, 5);
            } else if (cmd.type === "scaleMove") {
                ctx.fillStyle = "blue";
                ctx.fillRect(cmd.x * 10, cmd.y * 10, 5 * cmd.scale, 5 * cmd.scale);
            } else if (cmd.type === "fadeMove") {
                ctx.globalAlpha = cmd.opacity;
                ctx.fillStyle = "green";
                ctx.fillRect(cmd.x * 10, cmd.y * 10, 5, 5);
                ctx.globalAlpha = 1.0;
            }

            if (cmd.condition) {
                console.log("Condition Triggered:", cmd.condition);
                executeCondition(cmd.condition, cmd);
            }
        });
    }

    function executeCondition(condition, cmd) {
        let conditionParts = condition.split(",").map(c => c.trim());
        conditionParts.forEach(part => {
            if (part.startsWith("atDirect(")) {
                let match = part.match(/atDirect\(([^)]+)\)/);
                if (match) {
                    let coords = match[1].split(",").map(p => p.trim().split(":")[1]);
                    let x = parseFloat(coords[0]);
                    let y = parseFloat(coords[1]);
                    if (cmd.x === x && cmd.y === y) {
                        console.log("atDirect Condition Met for", cmd.obj);
                    }
                }
            } else if (part.startsWith("@set ")) {
                let setValue = part.replace("@set ", "").trim();
                console.log("Setting value:", setValue);
            } else if (part.startsWith("goto endPoint")) {
                console.log("Moving", cmd.obj, "to endpoint");
            }
        });
    }

    function runAnimation() {
        const code = codeEditor.innerText.trim();
        let commands = parseAnimationCode(code);
        executeCommands(commands);
    }

    playButton.addEventListener("click", runAnimation);
    drawGrid();
});
