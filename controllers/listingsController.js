const BaseController = require("./baseController");

class ListingsController extends BaseController {
  constructor(model, userModel) {
    super(model);
    this.userModel = userModel;
  }

  /** if a method in this extended class AND the base class has the same name, the one in the extended class will run over the base method */
  // Create listing. Requires authentication.
  async insertOne(req, res) {
    const {
      title,
      category,
      condition,
      price,
      description,
      shippingDetails,
      currUser,
    } = req.body;
    console.log(currUser.given_name);
    console.log(currUser.family_name);
    try {
      // TODO: Get seller email from auth, query Users table for seller ID
      const [user, created] = await this.userModel.findOrCreate({
        where: { email: currUser.email },
        defaults: {
          first_name: currUser.given_name,
          last_name: currUser.family_name,
          phone_num: currUser.phone_num,
        },
      });

      console.log(user.id);

      // Create new listing
      const newListing = await this.model.create({
        title: title,
        category: category,
        condition: condition,
        price: price,
        description: description,
        shippingDetails: shippingDetails,
        buyerId: null,
        sellerId: user.id, // TODO: Replace with seller ID of authenticated seller
      });

      // Respond with new listing
      return res.json(newListing);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // Retrieve specific listing. No authentication required.
  async getOne(req, res) {
    const { listingId } = req.params;
    try {
      const output = await this.model.findByPk(listingId);
      return res.json(output);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // Buy specific listing. Requires authentication.
  async buyItem(req, res) {
    const { listingId } = req.params;
    const { user } = req.body;
    try {
      const data = await this.model.findByPk(listingId);

      // TODO: Get buyer email from auth, query Users table for buyer ID
      const [currUser, created] = await this.userModel.findOrCreate({
        where: { email: user.email },
        defaults: {
          first_name: user.given_name,
          last_name: user.family_name,
          phone_num: user.phone_num,
        },
      });
      console.log(`Current user id: ${currUser.id} ${currUser.first_name}`);
      await data.update({ buyerId: currUser.id }); // TODO: Replace with buyer ID of authenticated buyer

      // Respond to acknowledge update
      return res.json(data);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }
}

module.exports = ListingsController;
