import * as vscode from 'vscode';
import psTree from "ps-tree";

export function activate(context: vscode.ExtensionContext) {
	vscode.debug.onDidReceiveDebugSessionCustomEvent((e)=>console.log(e));
	vscode.debug.onDidStartDebugSession((debugSession)=>{
		if(debugSession.type === "lldb" && debugSession.configuration.autoAttach) {
			if(debugSession.configuration.pid) {
				psTree(debugSession.configuration.pid, (err, children) => {
					if(err) {
						return;
					} else {
						children.forEach((a, i) => {vscode.debug.startDebugging(undefined,{
							...debugSession.configuration,
							pid: a.PID,
							name: `${debugSession.configuration.name} child ${i}`
						})});
					}
				});
			}
			console.log(debugSession);
		} 
	})	
}

export function deactivate() {}
