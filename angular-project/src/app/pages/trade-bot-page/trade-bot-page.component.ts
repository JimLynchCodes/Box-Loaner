
import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TdApiService, BuyOrSell } from '../../services/td-api/td-api.service';
import { ToastManagerService } from '../../services/toast-manager/toast-manager.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { EnableGainslockerModalService } from '../../components/modals/enable-gainslock-confirm/enable-gainslock-modal.service';
import { AskCancelOrderModalService } from '../../components/modals/ask-cancel-order/ask-cancel-order-modal.service';
import { AskPlaceTradeModalService } from 'src/app/components/modals/ask-place-trade/ask-place-trade-modal.service';
import { interval } from 'rxjs';
import { decideLimitPrice } from 'src/app/services/limit-price-decider';
import { decideBuyOrSell } from 'src/app/services/buy-or-sell-decider';
import { StrangulatorService } from 'src/app/strangulator.service';
import { BoxAnalyzerService } from 'src/app/box-analyzer.service';

const fakeBuyOrder1 = {
  quantity: 1,
  price: 2,
  orderLegCollection: [{
    instruction: 'BUY',
    instrument: {
      symbol: 'MSFT'
    }
  }],
  reasons: [{
    text: 'spike up in volume',
  },
  {
    text: 'just picked up a great new CTO'
  },
  {
    text: 'price has been steadily climbing'
  },
  {
    text: 'triple gainers list 10/14/2020 with 80% buy recc'
  }]

}

const fakeBuyOrder2 = {
  quantity: 2,
  price: 3.45,
  orderLegCollection: [{
    instruction: 'BUY',
    instrument: {
      symbol: 'AAPL'
    }
  }],
  reasons: [{
    text: 'spike up in volume',
  },
  {
    text: 'just picked up a great new CTO'
  },
  {
    text: 'price has been steadily climbing'
  },
  {
    text: 'triple gainers list 10/14/2020 with 80% buy recc'
  }
  ]

}

const fakeBuyOrder3 = {
  quantity: 1,
  price: 265.23,
  orderLegCollection: [{
    instruction: 'BUY',
    instrument: {
      symbol: 'TSLA'
    }
  }],
  reasons: [{
    text: 'spike up in volume',
  },
  {
    text: 'just picked up a great new CTO'
  },
  {
    text: 'price has been steadily climbing'
  },
  {
    text: 'triple gainers list 10/14/2020 with 80% buy recc'
  }
  ]

}

const fakeSellOrder1 = {
  quantity: 1,
  price: 1000,
  orderLegCollection: [{
    instruction: 'SELL',
    instrument: {
      symbol: 'TSLA'
    }
  }]
}

@Component({
  selector: 'app-trade-bot-page',
  templateUrl: './trade-bot-page.component.html',
  styleUrls: ['./trade-bot-page.component.scss'],
})
export class TradeBotPageComponent {

  accountNumber: string;

  accountsData: any;

  // largecapTickers = ['TSM', 'TSLA', 'BABA', 'WMT', 'DIS', 'BAC', 'NVDA', 'PYPL', 'INTC', 'NFLX']
  largecapTickers = []
  // etfTickers = ['IWM', 'QQQ', 'EEM', 'EWZ', 'IWM', 'XLF', 'SQQQ', 'SLV', 'GDX', 'XLE']
  etfTickers = ['SPX', 'NDX', 'RUT', 'VIX']
  memeStonkTickers = ['GME', 'AMC', 'MVIS', 'VIAC', 'RKT', 'AMD', 'MSFT', 'PLTR', 'TLRY', 'NIO', 'UBER', 'APHA', 'EBAY', 'MDB', 'NFLX', 'TSLA', 'NVDA', 'DIS', 'SNAP', 'COST', 'SBUX', 'UNH', 'CVS', 'UPS', 'SHW']
  // memeStonkTickers = ['GME', 'AMC', 'MVIS', 'VIAC', 'RKT', 'AMD', 'MSFT', 'PLTR', 'TLRY', 'NIO', 'UBER', 'APHA', 'EBAY', 'MDB']
  solidProfitMakersTickers = ['MELI', 'APPL', 'AMZN', 'FB', 'COST', 'EW', 'BAND', 'SPOT', 'MAXR', 'LW', 'HD', 'MARA', 'BITO']
  // memeStonkTickers = ['GME', 'MDB']
  bestInClassTickers = ['GOOG', 'GOOGL', 'APPL', 'AMZN', 'FB', 'COST']

  rowsInTickerTable = 0
  arrayOfRowIndicies = []

  allSymbols = []

  // strangulations = [];
  analyzedSpreads = [];

  constructor(private http: HttpClient,
    private tdApiSvc: TdApiService,
    private strangulator: StrangulatorService,
    private boxAnalyzer: BoxAnalyzerService
  ) { }

  access_token = ''

  gotTdData = false

  async ngOnInit() {

    this.allSymbols = [
      // ...this.largecapTickers,
      ...this.etfTickers,
      // ...this.memeStonkTickers,
      // ...this.solidProfitMakersTickers
    ]

    this.rowsInTickerTable = Math.max(
      // this.largecapTickers.length,
      this.etfTickers.length,
      // this.memeStonkTickers.length,
      // this.solidProfitMakersTickers.length
    );

    this.arrayOfRowIndicies = Array.from(Array(this.rowsInTickerTable).keys())

    if (!this.accountsData) {

      this.accountsData = await this.tdApiSvc.getPositions();

      this.allSymbols.forEach(async symbol => {

        const optionChain: any = await this.tdApiSvc.getOptionChainForSymbol(symbol);

        // const minAcceptableDelta = -0.002
        // const maxAcceptableDelta = 0.002

        // const minAcceptableGamma = -0.01
        // const maxAcceptableGamma = 0.01

        // console.log('chain for ' + symbol + ': ', optionChain)

        if (optionChain['underlying']) {

          const spreadsForTicker = this.strangulator.analyzePutSpreads(symbol, optionChain.putExpDateMap, optionChain.underlying);

          const spreadsForTicker2 = this.boxAnalyzer.analyzeBoxSpreads(symbol, optionChain.callExpDateMap, optionChain.putExpDateMap, optionChain.underlying);

          // const strangulation = this.strangulator.strangulate(
          //   optionChain['callExpDateMap'],
          //   optionChain['putExpDateMap'],
          //   optionChain['underlying']['last'],
          //   minAcceptableDelta,
          //   maxAcceptableDelta,
          //   minAcceptableGamma,
          //   maxAcceptableGamma
          // )

          this.analyzedSpreads.push(spreadsForTicker2);

          // this.strangulations = this.strangulations.filter(strangulation => {
          //   return strangulation.length > 0
          // })

          // this.strangulations = this.strangulations.sort((a, b) => {
          //   return a[0].thetaPower > b[0].thetaPower ? 1 : -1
          // })

          // console.log('the gud ones are..... ', this.strangulations);

          this.analyzedSpreads = this.analyzedSpreads.sort((a, b) => {

            console.log('comparing percentDiscountPerDay ' + a[0].percentDiscountPerDay + ' to ' + b[0].percentDiscountPerDay)

            return a[0].percentDiscountPerDay > b[0].percentDiscountPerDay ? -1 : 1
          })
        }
      })
    }
  }
}
