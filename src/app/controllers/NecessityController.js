import * as Yup from 'yup';

import Necessity from '../models/Necessity';

class NecessityController {
  async store(req, res) {
    const schema = Yup.object().shape({
      item: Yup.string().required(),
      category: Yup.string().required(),
      name: Yup.string().required(),
      phone: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Failed to validate fields' });
    }

    const location = {
      type: 'Point',
      coordinates: [req.body.longitude, req.body.latitude],
    };

    req.body.location = location;
    req.body.user_id = req.userId;

    const necessity = await Necessity.create(req.body);

    const { _id, item, category, name, phone } = necessity;

    return res.json({
      _id,
      item,
      category,
      name,
      phone,
    });
  }

  async show(req, res) {
    const { id } = req.params;

    const necessity = await Necessity.findById(id, {
      _id: 0,
      user_id: 0,
      location: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    });

    if (!necessity) {
      return res.status(400).json({ error: 'Necessity not found' });
    }

    return res.json(necessity);
  }

  async index(req, res) {
    const { userId } = req.params;

    const necessity = await Necessity.find(
      { user_id: userId },
      {
        user_id: 0,
        location: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      }
    );

    if (!necessity) {
      return res.status(400).json({ error: 'Necessity or user not found' });
    }

    return res.json(necessity);
  }

  async update(req, res) {
    const { id } = req.params;

    const necessity = await Necessity.findById(id);

    if (!necessity) {
      return res.status(400).json({ error: 'Necessity not found' });
    }

    if (necessity.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to update this necessity" });
    }

    await necessity.update(req.body);

    const { item, category, quantity, name, phone } = await Necessity.findById(
      id
    );

    return res.json({
      item,
      category,
      quantity,
      name,
      phone,
    });
  }

  async destroy(req, res) {
    const { id } = req.params;

    const necessity = await Necessity.findById(id);

    if (!necessity) {
      return res.status(400).json({ error: 'Necessity not found' });
    }

    if (necessity.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You don't have permission to delete this necessity" });
    }

    await necessity.remove();

    return res.send();
  }
}

export default new NecessityController();
