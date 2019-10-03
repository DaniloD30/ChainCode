/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const Aux = require('./aux.js');
const fs = require('fs');

class MyAssetContract extends Contract {

    async myAssetExists(ctx, myAssetId) {
        const buffer = await ctx.stub.getState(myAssetId);
        return (!!buffer && buffer.length > 0);
    }

    async createMyAsset(ctx, myAssetId, localidade, idade, sexo) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (exists) {
            throw new Error(`The my asset ${myAssetId} already exists`);
        }
        const asset = { 
            data: new Date(),
            doenca: [],
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
    }

    async readMyAsset(ctx, myAssetId) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myAssetId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateMyAsset(ctx, myAssetId, newValue) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myAssetId, buffer);
    }

    async deleteMyAsset(ctx, myAssetId) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The my asset ${myAssetId} does not exist`);
        }
        await ctx.stub.deleteState(myAssetId);
    }

    async createDoenca(ctx, myAssetId, doenca, localidade, sexo, idade) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The university ${myAssetId} does not exist`);
        }
        var university = await ctx.stub.getState(myAssetId);
        university = JSON.parse(university);
        const doencaa = {
            localidade: localidade,
            sexo: sexo,
            idade: idade,
            doenca: doenca,
            date: new Date()
        };
        university.doenca.push(doencaa);
        const buffer = Buffer.from(JSON.stringify(university));
        await ctx.stub.putState(myAssetId, buffer);
    }

    async readUniversityHistory(ctx, myAssetId) {
        const exists = await this.myAssetExists(ctx, myAssetId);
        if (!exists) {
            throw new Error(`The university ${myAssetId} does not exist`);
        }
        const history = await ctx.stub.getHistoryForKey(myAssetId);
        const universityHistory = history !== undefined ? await Aux.iteratorForJSON(history, true) : [];
        const stringUniversityHistory = JSON.stringify(universityHistory);
        fs.writeFile('history.json', stringUniversityHistory, err => {
            if (err) console.error(err);
            console.log('History CREATED!');
        });
        return {
            status: 'Ok',
            history: stringUniversityHistory
        }
    }

}

module.exports = MyAssetContract;
