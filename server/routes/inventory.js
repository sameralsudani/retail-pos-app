const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const Category = require("../models/Category");

// Get all inventory records
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("product", "name sku")
      .populate("category", "name");
    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get inventory by product or category
router.get("/by", async (req, res) => {
  try {
    const { product, category } = req.query;
    const filter = {};
    if (product) filter.product = product;
    if (category) filter.category = category;
    const inventory = await Inventory.find(filter)
      .populate("product", "name sku")
      .populate("category", "name");
    res.json({ success: true, data: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create or update inventory record
router.post("/", async (req, res) => {
  try {
    const { product, category, quantity, costPrice, reorderLevel, lastRestocked } =
      req.body;
    let record = await Inventory.findOne({ product, category });
    if (record) {
      record.quantity = quantity;
      record.costPrice = costPrice;
      record.reorderLevel = reorderLevel;
      record.lastRestocked = lastRestocked;
      record.lastUpdated = new Date();
      await record.save();
      return res.json({ success: true, data: record });
    } else {
      const newRecord = new Inventory({ product, category, quantity, costPrice, reorderLevel, lastRestocked });
      await newRecord.save();
      return res.status(201).json({ success: true, data: newRecord });
    }
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update inventory record by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const record = await Inventory.findByIdAndUpdate(id, updates, { new: true });
    if (!record) {
      return res.status(404).json({ success: false, message: "Inventory record not found" });
    }
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Adjust inventory quantity (increment/decrement)
router.patch("/:id/adjust", async (req, res) => {
  try {
    const { amount } = req.body;
    const record = await Inventory.findById(req.params.id);
    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Inventory record not found" });
    record.quantity += amount;
    record.lastUpdated = new Date();
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete inventory record
router.delete("/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
