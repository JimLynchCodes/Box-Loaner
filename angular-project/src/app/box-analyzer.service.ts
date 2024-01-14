import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BoxAnalyzerService {

  constructor() { }

  analyzeBoxSpreads(ticker: string, callExpirationMap: any, putExpirationMap: any, underlyingData: any) {

    console.log('undy', underlyingData)
    console.log('undy last', underlyingData.last)

    console.log('analyzing spreads for: ', ticker, putExpirationMap);

    const gudOnes = [];

    // loop through expiration tables
    Object.entries(putExpirationMap).forEach(([expirationString, puts], expirationLoopIndex) => {

      const calls = callExpirationMap[expirationString]
      // TODO - calculate       

      console.log(ticker + 'expirationString: ', expirationString);
      console.log(ticker + ' puts: ', puts);

      console.log('expirationLoopIndex ', expirationLoopIndex);

      // ONLY take first three expirations:
      if (expirationLoopIndex === 0 ||
        expirationLoopIndex === 1 ||
        expirationLoopIndex === 2) {

        // loop through strikes for a given expiration cycle
        // Object.entries(puts).forEach( ([strike, put], entryIndex) => {

        //   console.log(ticker + 'strike: ', strike);
        //   console.log(ticker + ' put: ', put);

        //   if (puts)

        // })

        const strikes = Object.keys(puts)

        for (var i = 0; i < strikes.length; i++) {

          const strike = strikes[i];

          // console.log(ticker + ' strike: ', strike);
          console.log(ticker + ' put: ', puts[strike]);
          // console.log(ticker + ' next put: ', strikes[i + 1])

          const MAX_GAP = 3;

          // for (var gapperIndex = 0; gapperIndex < MAX_GAP; gapperIndex++)
          // if (strikes[i + 1 + gapperIndex])

          if (strikes[i + 1]) {

            
            // const lowerStrikePutBid = puts[strikes[i]][0].bid

            // const lowerStrikePutBidAskMidpoint = (puts[strikes[i]][0].ask + lowerStrikePutBid) / 2

            // console.log(ticker + ' -- higher strike bid: ' + puts[strikes[i]][0].bid)
            // console.log(ticker + ' -- higher strike ask' + puts[strikes[i]][0].ask)
            // console.log(ticker + ' -- higher strike bid/ask midpoint: ' + higherStrikePutBidAskMidpoint)

            // const higherStrikePutBid = puts[strikes[i + 1]][0].bid;
            // short put (higher strike)

            // console.log(ticker + ' -- higher strike: ' + higherStrike)
            // console.log(ticker + ' -- higher strike theta: ' + puts[strikes[i + 1]][0].theta)


            // console.log(ticker + ' -- lower strike bid: ' + puts[strikes[i + 1]][0].bid)
            // console.log(ticker + ' -- lower strike ask' + puts[strikes[i + 1]][0].ask)
            // console.log(ticker + ' -- lower strike bid/ask midpoint: ' + lowerStrikePutBidAskMidpoint)

            // const netTheta = (puts[strikes[i]][0].theta - puts[strikes[i + 1]][0].theta);
            // console.log(ticker + ' ----- net theta: ' + netTheta);

            // const netDelta = (puts[strikes[i]][0].delta - puts[strikes[i + 1]][0].delta);
            // console.log(ticker + ' ----- net delta: ' + netDelta);

            // const netCreditForSpread = higherStrikePutBidAskMidpoint - lowerStrikePutBidAskMidpoint

            // console.log(ticker + ' ----- net credit: ' + netCreditForSpread);

            // const strikeWidth = puts[strikes[i + 1]][0].strikePrice - puts[strikes[i]][0].strikePrice

            // console.log(ticker + ' ----- strikeWidth: ' + strikeWidth);

            // const maxLoss = strikeWidth - netCreditForSpread

            // console.log(ticker + ' ----- max loss for spread: ' + maxLoss);

            // const tomlScore = netTheta / maxLoss;

            // console.log(ticker + ' ----- toml score: ' + tomlScore);

            // only positive theta, no debit spreads
            // if (netTheta > 0 && netCreditForSpread > 0 && tomlScore < Infinity) {

            // don't go for options with zero bidders!
            // if (lowerStrikePutBid > 0 && higherStrikePutBid > 0) {

            // only OTM puts...
            // if (higherStrike < underlyingData.last) {

            // const fortnightAway = new Date(Date.now() + 1.21e9);

            // const expirationDate = new Date(puts[strike][0].expirationDate);


            // console.log('time exp: ', puts[strike][0].expirationDate);
            // console.log('time 2: ', fortnightAway);
            // console.log('time: ', expirationDate);

            // if (expirationDate > fortnightAway) {


            const lowerStrike = puts[strikes[i]][0].strikePrice;
            const higherStrike = puts[strikes[i + 1]][0].strikePrice;
            // long put (lower strike)

            console.log(ticker + ' -- lower strike: ' + lowerStrike)
            console.log(ticker + ' -- higher strike: ' + higherStrike)
            
            const lowerStrikeCallBidAskMidpoint = (calls[strikes[i]][0].ask + calls[strikes[i]][0].bid) / 2;
            const lowerStrikePutBidAskMidpoint = (puts[strikes[i]][0].ask + puts[strikes[i]][0].bid) / 2;
            const higherStrikeCallBidAskMidpoint = (calls[strikes[i + 1]][0].ask + calls[strikes[i + 1]][0].bid) / 2;
            const higherStrikePutBidAskMidpoint = (puts[strikes[i + 1]][0].ask + puts[strikes[i + 1]][0].bid) / 2;

            const daysTilExpiration = expirationLoopIndex + 1; // TODO - calcualte this better for all expirations

            // pay for (buy) the lower call and higher put
            const netDebitToPay = lowerStrikeCallBidAskMidpoint +
              higherStrikePutBidAskMidpoint -
              // sell higher strike call and lower strike put
              higherStrikeCallBidAskMidpoint -
              lowerStrikePutBidAskMidpoint

            const expirationValue = (higherStrike - lowerStrike) * 100;

            const percentDiscount = netDebitToPay / expirationValue * 100;

            const percentDiscountPerDay = percentDiscount / daysTilExpiration;

            gudOnes.push({
              ticker,
              underlyingPrice: underlyingData.last,
              higherStrike,
              lowerStrike,
              daysTilExpiration,
              expirationCycle: expirationString,
              netDebitToPay,
              expirationValue,
              percentDiscount,
              percentDiscountPerDay
              // higherStrikePutBidAskMidpoint,
              // lowerStrikePutBidAskMidpoint,
              // netTheta,
              // netDelta,
              // netCreditForSpread,
              // maxLoss,
              // tomlScore
            })
          }
        }
      }
    });

    const gudOnesSorted = gudOnes.sort((a, b) => a.percentDiscountPerDay > b.percentDiscountPerDay ? -1 : 1)

    console.log(gudOnesSorted.length)
    console.log('done calculating spreads!')

    return gudOnesSorted.slice(0, 25);

  }
}
