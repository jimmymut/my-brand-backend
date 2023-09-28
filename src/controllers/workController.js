import Work from "../models/work";

export const createWork = async (req, res) => {
  try {
    const { title, body } = req.body;
    const existWork = await Work.findOne({ title });
    if (existWork) {
      return res
        .status(409)
        .json({ message: "This work already exist!" });
    }
    const work = new Work({
      title,
      body,
    });
    const newWork = await work.save();
    return res.status(201).json({newWork});
  } catch (error) {
    return res.status(500).json({error: `Error creating work, ${error}`});
  }
};

export const getAllWorks = async (req, res) => {
  try {
    const works = await Work.find();
    return res.status(200).json({works});
  } catch (error) {
    return res.status(500).json({error: `Error fetching works, ${error}`});
  }
};

export const updateWork = async (req, res) => {
  try {
    const id = req.params.id;
    const existWork = await Blog.findOne({ _id: id });
    if (!existWork) {
      return res.status(404).json({ error: "Work doesn't exist!" });
    }
    if (req.body.title) {
      existWork.title = req.body.title;
    }
    if (req.body.body) {
      existWork.body = req.body.body;
    }
    const updatedWork = await existWork.save();
    return res.status(200).json({ updatedWork });
  } catch (error){
    return res.status(500).json({ error: `Server error! ${error}` });
  }
};

export const deleteWork = async (req, res) => {
  try {
    const exist = await Work.findById(req.params.id);
    if (!exist) {
      return res.status(404).json({ error: "Work not found!" });
    }
    await Work.deleteOne({ _id: req.params.id });
    return res.status(204).json({message: "work deleted"});
  } catch (err) {
    return res.status(500).json({error: `Error deleting work, ${err}`});
  }
};
