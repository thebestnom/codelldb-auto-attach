import * as vscode from 'vscode';
import psTree from "ps-tree";

let runningConfigs: Record<string, { interval: NodeJS.Timer, pid: string }> = {};
let sessionWaitingForPid: vscode.DebugSession | undefined = undefined;
const knownPids = new Set<string>();
let ranPid: string | undefined = undefined;
const defaultCheckInterval = 100;
const removedPids = new Set<string>();

function checkChildInterval(pid: string, debugSession: vscode.DebugSession) {
	return () => {
		psTree(Number(pid), (err, children) => {
			if (err) {
				return;
			} else {
				children.forEach((proc, i) => {
					if (!knownPids.has(proc.PID) && !removedPids.has(proc.PID)) {
						knownPids.add(proc.PID);
						vscode.debug.startDebugging(undefined, {
							...debugSession.configuration,
							request: "attach",
							pid: proc.PID,
							name: `child ${i}`
						}, debugSession);
					}
				});
			}
		})
	}
}

export function activate(context: vscode.ExtensionContext) {
	vscode.debug.registerDebugAdapterTrackerFactory('lldb', {
		createDebugAdapterTracker(session: vscode.DebugSession) {
			return {
				onDidSendMessage: (m: {type: string, event?: string, body?: {output?: string}}) => {
					if(m.type !== "event" && m.event !== "output" || !m.body?.output) {
                        return;
                    }
					const processMessage = /^Launched process (\d+)/.exec(m.body.output);
					if(processMessage) {
						const pid = processMessage[1];
						if(sessionWaitingForPid) {
							knownPids.add(pid);
							runningConfigs[sessionWaitingForPid.id] = {	
								pid,
								interval: setInterval(
									checkChildInterval(processMessage[1], sessionWaitingForPid),
									 sessionWaitingForPid.configuration.autoAttachChildProcessCheckInterval ?? defaultCheckInterval
								)
							};
						} else {
							ranPid = pid;
						}
					}
				}
			};
		}
	});

	vscode.debug.onDidStartDebugSession((debugSession) => {
		if (debugSession.type === "lldb" && debugSession.configuration.autoAttachChildProcess) {
			let pid: string;

			if (debugSession.configuration.pid) {
				pid = debugSession.configuration.pid;
			} else {
				if(ranPid) {
					pid = ranPid;
					ranPid = undefined;
				} else {
					sessionWaitingForPid = debugSession;
					return;
				}
			}
			knownPids.add(pid);
			runningConfigs[debugSession.id] = {
				pid,
				interval: setInterval(checkChildInterval(pid, debugSession), debugSession.configuration.autoAttachChildProcessCheckInterval ?? defaultCheckInterval)
			};
		}
	})
	vscode.debug.onDidTerminateDebugSession((debugSession) => {
		clearInterval(runningConfigs[debugSession.id].interval);
		knownPids.delete(runningConfigs[debugSession.id].pid);
		removedPids.add(runningConfigs[debugSession.id].pid);
		delete runningConfigs[debugSession.id];
	});

}

export function deactivate() {
	runningConfigs = {};
	knownPids.clear();
	ranPid = undefined;
	sessionWaitingForPid = undefined;
	removedPids.clear();
}
