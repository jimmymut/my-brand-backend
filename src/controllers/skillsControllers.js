import Skill from "../models/skills";
import { cloudinary } from "../config";

export const createSkill = async (req, res) => {
  try {
    const { name, summary } = req.validatedData;
    const existSkill = await Skill.findOne({ name });
    if (existSkill) {
      return res.status(409).json({ message: "This skill already exist!" });
    }
    const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
      folder: "skill_icons",
    });
    const skill = new Skill({
      name,
      summary,
      icon: uploadedImage.secure_url,
    });
    const newSkill = await skill.save();
    return res.status(201).json({ newSkill });
  } catch (error) {
    return res.status(500).json({ error: `Error creating skill, ${error}` });
  }
};

export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    return res.status(200).json({ skills });
  } catch (error) {
    return res.status(500).json({ error: `Error fetching skills, ${error}` });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, summary } = req.validatedData;
    const existSkill = await Blog.findOne({ _id: id });
    if (!existSkill) {
      return res.status(404).json({ error: "Skill doesn't exist!" });
    }
    if (name) {
      existSkill.name = name;
    }
    if (summary) {
      existSkill.summary = summary;
    }
    if (req.file) {
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, {
        folder: "skill_icons",
      });
      existSkill.icon = uploadedImage.secure_url;
    }
    const updatedSkill = await existSkill.save();
    return res.status(200).json({ updatedSkill });
  } catch (error) {
    return res.status(500).json({ error: `Server error! ${error}` });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const exist = await Skill.findById(req.params.id);
    if (!exist) {
      return res.status(404).json({ error: "Skill not found!" });
    }
    await Skill.deleteOne({ _id: req.params.id });
    return res.status(204).json({ message: "Skill deleted" });
  } catch (err) {
    return res.status(500).json({ error: `Error deleting skill, ${err}` });
  }
};
