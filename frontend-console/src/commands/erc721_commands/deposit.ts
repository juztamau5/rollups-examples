// Copyright 2022 Cartesi Pte. Ltd.

// Licensed under the Apache License, Version 2.0 (the "License"); you may not use
// this file except in compliance with the License. You may obtain a copy of the
// License at http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.

import { IERC721__factory, IInput } from "@cartesi/rollups";
import { ContractReceipt, ethers } from "ethers";
import { Argv } from "yargs";
import { InputKeys } from "../types";
import { networks } from "../../networks";
import {
    connect,
    Args as ConnectArgs,
    builder as connectBuilder,
} from "../../connect";
import {
    rollups,
    Args as RollupsArgs,
    builder as rollupsBuilder,
} from "../../rollups";

interface Args extends ConnectArgs, RollupsArgs {
    erc721?: string;
    id: string;
    amount: string;
}

export const command = "deposit";
export const describe = "Deposit ERC-721 tokens in DApp";

const tokenAddress = (chainId: number): string | undefined => {
    const network = networks[chainId];
    if (!network) {
        return; // undefined
    }

    try {
        if (network.name == "localhost") {
            return require("../../../../deployments/localhost/CartesiToken.json")
                .address;
        } else if (network) {
            return require(`@cartesi/token/deployments/${network.name}/CartesiToken.json`)
                .address;
        }
    } catch (e) {
        return; // undefined
    }
};

export const builder = (yargs: Argv<Args>) => {
    // args regarding connecting to provider
    const connectArgs = connectBuilder(yargs, true);

    // args regarding connecting to rollups
    const rollupsArgs = rollupsBuilder(connectArgs);

    // this command args
    return rollupsArgs
        .option("erc721", {
            describe: "ERC-721 contract address",
            type: "string",
        })
        .option("id", {
            demandOption: true,
            type: "string",
            describe: "Token ID of the ERC-721 token to deposit",
        });
};

/**
 * Retrieve InputKeys from InputAddedEvent
 * @param receipt Blockchain transaction receipt
 * @returns input identification keys
 */
export const findInputAddedInfo = (
    receipt: ContractReceipt,
    inputContract: IInput
): InputKeys => {
    if (receipt.events) {
        for (const event of receipt.events) {
            try {
                const parsedLog = inputContract.interface.parseLog(event);
                if (parsedLog.name == "InputAdded") {
                    return {
                        epoch_index: parsedLog.args.epochNumber.toNumber(),
                        input_index: parsedLog.args.inputIndex.toNumber(),
                    };
                }
            } catch (e) {
                // do nothing, just skip to try parsing the next event
            }
        }
    }
    throw new Error(
        `InputAdded event not found in receipt of transaction ${receipt.transactionHash}`
    );
};

export const handler = async (args: Args) => {
    const { rpc, address, mnemonic, accountIndex, erc721, id } = args;

    // connect to provider
    console.log(`connecting to ${rpc}`);
    const { provider, signer } = connect(rpc, mnemonic, accountIndex);

    const network = await provider.getNetwork();
    console.log(`connected to chain ${network.chainId}`);

    // connect to rollups,
    const { inputContract, erc721Portal } = await rollups(
        network.chainId,
        signer || provider,
        args
    );

    // connect to provider, use deployment address based on returned chain id of provider
    const erc721Address = erc721 ?? tokenAddress(network.chainId);
    if (!erc721Address) {
        throw new Error(
            `cannot resolve ERC-721 address for chain ${network.chainId}`
        );
    }
    console.log(`using ERC-721 token contract at address "${erc721Address}"`);

    const erc721TokenID = ethers.BigNumber.from(id);
    const erc721TokenAmount = ethers.BigNumber.from(amount);

    // Approve erc721 transfers first if necessary
    const erc721Contract = IERC721__factory.connect(
        erc721Address,
        erc721Portal.signer
    );
    const signerAddress = await erc721Portal.signer.getAddress();
    console.log(`using account "${signerAddress}"`);
    /*
    const isApprovedForAll = await erc721Contract.isApprovedForAll(
        signerAddress,
        erc721Portal.address
    );
    if (!isApprovedForAll) {
        console.log("approving tokens...");
        const tx = await erc721Contract.setApprovalForAll(
            erc721Portal.address,
            true
        );
        await tx.wait();
    }

    // send deposit transaction
    console.log(`depositing ${amount} of token ID ${id}...`);

    console.log(erc721Portal);
    const tx = await erc721Portal.erc721Deposit(
        erc721Address,
        erc721TokenID,
        erc721TokenAmount,
        "0x"
    );
    console.log(`transaction: ${tx.hash}`);
    console.log("waiting for confirmation...");
    const receipt = await tx.wait();

    // find added input information from transaction receipt
    const inputAddedInfo = findInputAddedInfo(receipt, inputContract);
    console.log(
        `deposit successfully executed as input ${inputAddedInfo.input_index} of epoch ${inputAddedInfo.epoch_index}`
    );
    */
};
