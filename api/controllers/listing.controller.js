import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

// Create new listing
export const createListing = async (req, res, next) => {
  try {
    console.log("Incoming Listing Data:", req.body);

     const listing = await Listing.create({
      ...req.body,
      userRef: req.user.id, // ✅ attach logged-in user as owner
      imageUrls: req.body.imageUrls || [], // optional if you handle images
    });

    console.log("Listing Created Successfully:", listing);
    return res.status(201).json({ success: true, listing });

  } catch (error) {
    console.error("Listing Creation Error:", error);
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
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found"));
    }

    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only delete your own listings!'));
    }

    try{
      await Listing.findByIdAndDelete(req.params.id);
      res.status(200).json('Listing has been deleted!');
    } catch (error) {
    next(error);
    }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({ success: true, listing: updatedListing });
  } catch (error) {
    next(error);
  }
};


export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
res.status(200).json({ success: true, listing });
  } catch (error) {
    next(error);
  }
};