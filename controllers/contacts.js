import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";
import Contact from "../models/contact.js";
import { Types } from "mongoose";

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({owner: req.user.id});
    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error getting all contacts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOneContact = async (req, res, next) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid _id" });
  }

  try {
    const contact = await Contact.findOne({ _id: id, owner: req.user.id });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (contact.owner.toString() !== req.user.id) {
      return res.status(404).send({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.error("Error fetching contact by id:", error);

    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findOneAndDelete({ _id: id, owner: req.user.id });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (contact.owner.toString() !== req.user.id) {
      return res.status(404).send({ message: "Contact not found" });
    }

    res.status(200).json(contact);
  } catch (error) {
    console.log(("Error delete contact by id:", error));
    next(error);
  }
};

export const createContact = async (req, res) => {
  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favorite: req.body.favorite,
    owner: req.user.id,
  };

  try {
    const { error } = createContactSchema.validate(req.body);

    if (error) {
        res.status(400).json({ message: error.message });
    }
    const result = await Contact.create(contact);

    if (result) {
      res.status(201).json(result);
    } else {
      res.status(500).json("Failed to add contact");
    }
  } catch (error) {
    console.error("Error creating contact:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const updateContact = async (req, res, next) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid _id" });
  }

  const { name, email, phone, favorite } = req.body;

  if (!name && !email && !phone && favorite === undefined) {
    return res.status(400).json("Body must have at least one field");
  }

  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (updatedContact.owner.toString() !== req.user.id) {
      return res.status(404).send({ message: "Contact not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  try {
    if (favorite === undefined) {
      return res.status(400).json({ message: "Field favorite is required" });
    }
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: req.user.id },
      { favorite },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (updatedContact.owner.toString() !== req.user.id) {
      return res.status(404).send({ message: "Contact not found" });
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Error updating contact status:", error);
    next(error);
  }
};
