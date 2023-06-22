import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	vscode.debug.onDidReceiveDebugSessionCustomEvent((e)=>console.log(e));
	vscode.debug.onDidStartDebugSession((debugSession)=>{
		if(debugSession.type === "lldb" && debugSession.configuration.autoAttach) {
			console.log(debugSession);
		} 
	})	
}

export function deactivate() {}
