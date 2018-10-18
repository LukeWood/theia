/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { v4 } from 'uuid';
import {
    Disposable,
    ILanguageClient,
    DocumentSelector,
    ClientCapabilities,
    ServerCapabilities,
    TextDocumentFeature,
    TextDocumentRegistrationOptions
} from '../language-client-services';
import { CallsRequest, CallsClientCapabilities, CallsServerCapabilities } from './calls-protocol.proposed';

export class CallsFeature extends TextDocumentFeature<TextDocumentRegistrationOptions> {

    constructor(readonly client: ILanguageClient) {
        super(client, CallsRequest.type);
    }

	fillClientCapabilities(capabilities: ClientCapabilities): void {
		if (!!capabilities.textDocument) {
			capabilities.textDocument = {};
		}
		const callsClientCapabilities = capabilities as CallsClientCapabilities;
		callsClientCapabilities.textDocument!.calls = {
			dynamicRegistration: true
		};
	}

    initialize(capabilities: ServerCapabilities, documentSelector: DocumentSelector): void {
		const callsServerCapabilities = capabilities as CallsServerCapabilities;
		if (!callsServerCapabilities.callsProvider) {
			return;
        }
        if (callsServerCapabilities.callsProvider === true) {
			if (!documentSelector) {
				return;
			}
			this.register(this.messages, {
				id: v4(),
				registerOptions: Object.assign({}, { documentSelector: documentSelector })
            });
            // todo: register this languageId
		} else {
            const implCapabilities = callsServerCapabilities.callsProvider;
			const id = typeof implCapabilities.id === 'string' && implCapabilities.id.length > 0 ? implCapabilities.id : v4();
			const selector = implCapabilities.documentSelector || documentSelector;
			if (selector) {
				this.register(this.messages, {
					id,
					registerOptions: Object.assign({}, { documentSelector: selector })
                });
                // todo: register this languageId
			}
		}
    }

    dispose(): void {
        // todo: unregister this languageId
        super.dispose();
    }

    protected registerLanguageProvider(): Disposable {
        return Disposable.create(() => {});
    }

}