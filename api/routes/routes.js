const express = require("express");

const router = express.Router();
const HistoricalDataModel = require("../models/HistoricalDataModel");
const SwapData = require("../models/SwapData");
const { updatePrices, getAllTokens } = require("../utils/ethersFunctions");
const {
  getAggregationForSortType,
  getMonthDiff,
} = require("../utils/aggregateObjects");

router.post("/new-swap", async (req, res) => {
  const data = new SwapData({
    traderAddress: req.body.traderAddress,
    tokenFrom: req.body.tokenFrom,
    tokenTo: req.body.tokenTo,
    amountGiven: req.body.amountGiven,
    amountReceived: req.body.amountReceived,
    date: req.body.date,
  });

  try {
    const dataToSave = await data.save();
    await updatePrices();
    res.status(200).json(dataToSave);
  } catch (e) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/get-user-swaps/:address", async (req, res) => {
  try {
    const data = await SwapData.find({ traderAddress: req.params.address })
      .sort({ date: "desc" })
      .skip(req.body.offset)
      .limit(req.body.limit);
    const dataCount = await SwapData.countDocuments({
      traderAddress: req.params.address,
    });
    res.json({ history: data, count: dataCount });
  } catch (e) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-prices/:sortType", async (req, res) => {
  try {
    const sortType = req.params.sortType;
    const today = new Date();
    let initialDate = null;

    const tokensList = await getAllTokens();

    switch (req.params.sortType) {
      case "ONE_DAY":
        initialDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1
        );
        break;
      case "FIVE_DAYS":
        initialDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 5
        );
        break;
      case "ONE_MONTH":
        initialDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate()
        );
        break;
      case "SIX_MONTHS":
        initialDate = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          today.getDate()
        );
        break;
      case "THIS_YEAR":
        initialDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      case "ONE_YEAR":
        initialDate = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate()
        );
        break;
      case "MAX":
        initialDate = null;
        break;
    }

    const firstRecordedObject = await HistoricalDataModel.find().limit(1);
    const firstRecordedDate =
      firstRecordedObject.length > 0 ? firstRecordedObject[0].date : null;

    const aggObject = getAggregationForSortType(
      sortType,
      tokensList,
      initialDate,
      firstRecordedDate
    );

    const data = await HistoricalDataModel.aggregate(aggObject);

    let lastEntries;
    if (getMonthDiff(initialDate ?? firstRecordedDate, new Date()) >= 8) {
      lastEntries = await HistoricalDataModel.find()
        .sort({ date: -1 })
        .limit(1);
    } else {
      lastEntries = [];
    }

    const historicalPricesData = [...data, ...lastEntries.reverse()];

    let maxPrice = 0;

    for (var i = 0; i < historicalPricesData.length; i++) {
      for (var z = 0; z < historicalPricesData[i].tokensData.length; z++) {
        if (historicalPricesData[i].tokensData[z].price > maxPrice) {
          maxPrice = historicalPricesData[i].tokensData[z].price;
        }
      }
    }

    res.json({
      historicalPrices: historicalPricesData,
      maxValue: maxPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
