class DropRateSimulation {
  constructor(params) {
    this.dropRate = params.dropRate;
    this.model = params.model;
    this.records = {
      dropLog: [],
      dryStreaks: [],
    };
    this.results = {
      killCount: 0,
      dropCount: 0,
      dryStreak: 0,
    };
  }

  run(n) {
    for (let i = 0; i < n; i++) {
      this.results.killCount++;
      if (Math.random() < this.dropRate) {
        this.results.dropCount++;
        this.records.dropLog.push(this.results.killCount);
        this.records.dryStreaks.push(this.results.dryStreak);
        this.results.dryStreak = 0;
      } else {
        this.results.dryStreak++;
      }
    }
  }
}

class BaseModelSimulation extends DropRateSimulation {
  constructor(params) {
    super({
      dropRate: params.dropRate,
      model: 'base',
    });
  }
}

class SimpleBadLuckMitigationSimulation extends DropRateSimulation {
  constructor(params) {
    super({
      dropRate: params.dropRate,
      model: 'simpleBadLuckMitigation',
    });
  }

  get dropRate() {
    const expectedDenominator = 1 / this._baseDropRate;
    if (this.results.dryStreak >= expectedDenominator * 2) {
      return this._baseDropRate * (this.results.dryStreak / expectedDenominator);
    } else {
      return this._baseDropRate;
    }
  }

  set dropRate(rate) {
    this._baseDropRate = rate;
  }
}

class FirstDropMitigationSimulation extends DropRateSimulation {
  constructor(params) {
    super({
      dropRate: params.dropRate,
      model: 'firstDropMitigation',
    });
  }

  get dropRate() {
    const expectedDenominator = 1 / this._baseDropRate;
    if (
      this.results.dropCount === 0 &&
      this.results.dryStreak >= expectedDenominator * 2
    ) {
      return this._baseDropRate * (this.results.dryStreak / expectedDenominator);
    } else {
      return this._baseDropRate;
    }
  }

  set dropRate(rate) {
    this._baseDropRate = rate;
  }
}

class CollectionLogAverageSimulation extends DropRateSimulation {
  constructor(params) {
    super({
      dropRate: params.dropRate,
      model: 'firstDropMitigation',
    });
  }

  get dropRate() {
    const expectedDenominator = 1 / this._baseDropRate;
    const averageDryStreak = this.results.killCount / (this.results.dropCount + 1);
    if (averageDryStreak >= expectedDenominator * 2) {
      return this._baseDropRate * (averageDryStreak / expectedDenominator);
    } else {
      return this._baseDropRate;
    }
  }

  set dropRate(rate) {
    this._baseDropRate = rate;
  }
}

export {
  DropRateSimulation,
  BaseModelSimulation,
  SimpleBadLuckMitigationSimulation,
  FirstDropMitigationSimulation,
  CollectionLogAverageSimulation,
};
