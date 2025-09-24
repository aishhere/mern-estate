import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

// Create new listing
export const createListing = async (req, res, next) => {
  try {
    console.log("📥 Incoming Listing Data:", req.body);

    const listing = await Listing.create(req.body);

    console.log("✅ Listing Created Successfully:", listing);
    return res.status(201).json({ success: true, listing });

  } catch (error) {
    console.error("❌ Listing Creation Error:", error);
    next(errorHandler(400, `Failed to create listing: ${error.message}`));
  }
};

// Get all listings
export const getListings = async (req, res, next) => {
  try {
    const listings = await Listing.find();
    res.status(200).json({ success: true, listings });
  } catch (error) {
    next(errorHandler(500, `Failed to fetch listings: ${error.message}`));
  }
};

// Get single listing by ID
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));
    res.status(200).json({ success: true, listing });
  } catch (error) {
    next(errorHandler(500, `Failed to fetch listing: ${error.message}`));
  }
};

// Delete listing
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found"));
    res.status(200).json({ success: true, message: "Listing deleted" });
  } catch (error) {
    next(errorHandler(500, `Failed to delete listing: ${error.message}`));
  }
};
