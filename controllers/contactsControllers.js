import {
    listContacts,
    getContactById,
    removeContact,
    addContact,
  } from "../services/contactsServices.js";

  import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";
  import HttpError from "../helpers/HttpError.js";
  import { updateContact as  updateContactFunc } from "../services/contactsServices.js";


export const getAllContacts = async (req, res) => {

    try {
        const contacts =  await listContacts();
        res.status(200).json(contacts)
    } 
    catch (error) {
        console.error("Error getting all contacts:", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};

export const getOneContact = async (req, res) => {

    try {
        const { id } = req.params;
        const contact = await getContactById(id);

        if(contact) {
            res.status(200).json(contact)
        }
        else{
            res.status(404).json({ "message": "Not found" })
        }
    } 
    catch (error) {
        console.error("Error fetching contact by id:", error);
       
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteContact = async (req, res) => {

 try {
    const { id } = req.params;
    const contact = await removeContact(id)

    if(contact) {
     res.status(200).json({contact})
    } 
    else{
        res.status(404).json({ "message": "Not found" })
    }
 } 
 catch (error) {
    console.log(("Error delete contact by id:", error));
    res.status(500).json({ message: "Internal server error" })
 }
};

export const createContact = async (req, res) => {

    try {
        const { error } = createContactSchema.validate(req.body)

        if( error ) {
            throw HttpError(400, error.message);
        }
        const {name, email, phone} = req.body;
        const newContact = await addContact(name, email, phone);
        
        if(newContact) {
            res.status(201).json(newContact) 
        }
        else {
            throw HttpError(500, "Failed to add contact");
        }
    } 
    catch (error) {
        console.error("Error creating contact:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
};

export const updateContact = async (req, res) => {
    try {
        const {id} = req.params;
        const { name, email, phone} = req.body;

        if( !name & !email & !phone ) {
            throw new HttpError(400, "Body must have at least one field");
        }

        const { error } = updateContactSchema.validate(req.body);
        if (error) {
         throw new HttpError(400, error.message);
        }

        const updatedContact = await updateContactFunc(id, {
            name,
            email,
            phone,
          });
          
          if(!updatedContact) {
            throw new HttpError(404, "Contact not found");
          }

          res.status(200).json(updatedContact)
    } 
    catch (error) {
        console.error("Error updating contact:", error);
        res.status(error.status || 500).json({ message: error.message || "Internal server error" })
    }
};