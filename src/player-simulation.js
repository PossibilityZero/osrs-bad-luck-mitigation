class PlayerSim {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    const newItem = {
      name: item.name,
      dropRate: {
        num: item.dropRate.num,
        denom: item.dropRate.denom,
      },
      simulation: new item.model({
        dropRate: item.dropRate.num / item.dropRate.denom,
      }),
    };
    this.items.push(newItem);
  }

  simulateKill(itemName, count = 1) {
    const item = this.items.find((item) => item.name === itemName);
    item.simulation.run(count);
  }

  getItem(itemName) {
    return this.items.find((item) => item.name === itemName);
  }

  getResults(itemName) {
    return this.items.find((item) => item.name === itemName).simulation.results;
  }

  getRecords(itemName) {
    return this.items.find((item) => item.name === itemName).simulation.records;
  }
}

class ItemFarmerSimulation extends PlayerSim {
  isSatisfied(itemName) {
    const item = this.getItem(itemName);
    return !!item.killLimit && this.getResults(itemName).killCount >= item.killLimit;
  }

  setKillLimit(itemName, limit) {
    this.items.find((item) => item.name === itemName).killLimit = limit;
  }
}

class ItemChaserSimulation extends PlayerSim {
  addItem(item) {
    item.simulation = new item.model({
      dropRate: item.dropRate.num / item.dropRate.denom,
    });
    item.targetDropCount = 1;
    this.items.push(item);
  }

  isSatisfied(itemName) {
    const item = this.getItem(itemName);
    return this.getResults(itemName).dropCount >= item.targetDropCount;
  }

  setTargetDropCount(itemName, count) {
    this.getItem(itemName).targetDropCount = count;
  }
}

export { PlayerSim, ItemFarmerSimulation, ItemChaserSimulation };
