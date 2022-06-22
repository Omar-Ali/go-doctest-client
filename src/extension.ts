import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import * as net from "net";

import {
  LanguageClient,
  LanguageClientOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export interface StreamInfo {
	writer: NodeJS.WritableStream;
	reader: NodeJS.ReadableStream;
	detached?: boolean;
}

export function activate(context: ExtensionContext) {
	let connectionInfo = {
		port: 7998,
		host: "127.0.0.1"
	};
  let serverOptions = () => {
    // Connect to language server via socket
    let socket = net.connect(connectionInfo);
    let result: StreamInfo = {
        writer: socket,
        reader: socket
    };
    return Promise.resolve(result);
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: 'go' }],
    synchronize: {
      // Notify the server about file changes to any file in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/*.*')
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'go-doctest-ls',
    'go-doctest-ls',
    serverOptions,
    clientOptions
  );

  // Start the client.
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
