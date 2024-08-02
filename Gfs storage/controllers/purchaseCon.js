const { PartySchema } = require('../../Models/Party Model/partyModel');
const { ItemSchema } = require('../../Models/Item Model/itemModel');
const { PurchaseSchema } = require('../../Models/Purchase Model/purchaseModel');
const getUserDatabaseConnection = require('../../middleware/db');
const Joi = require('joi');

const subdataSchema = Joi.object({
    // PurchaseTrnId: Joi.number(),
    ItemId: Joi.number().allow(''),
    Pcs: Joi.number().allow(''),
    BuyRate: Joi.number().allow(''),
    BuyDiscPer: Joi.number().allow(''),
    WholesaleRate : Joi.number().allow(''),
    WholesaleDisPer: Joi.number().allow(''),
    GSTPer: Joi.number().allow(''),
    NetAmount: Joi.number().allow(''),
    TotalAmount: Joi.number().allow(''),
    Discount: Joi.number().allow(''),
});

const PurchaseSchemaJOI = Joi.object({
    PurchaseId: Joi.number(),
    PartyId: Joi.number().required(),
    PaymentTerms: Joi.string(),
    DueDate: Joi.date().allow(''),
    BillDate: Joi.date().allow(''),
    BillNo: Joi.string().allow(''),
    Status: Joi.string().required(),
    StateOfSupply: Joi.string().allow(''),
    TotalAmount: Joi.number(),
    Discount: Joi.number(),
    ShippingCharge: Joi.number(),
    ShippingTax: Joi.number(),
    NetTotalAmount: Joi.number(),
    PaymentTypeId: Joi.number().allow(''),
    PaymentType: Joi.string().allow(''),
    PaidAmount: Joi.number(),
    Balance: Joi.number(),
    SubData: Joi.array().items(subdataSchema).allow('').required(),
    Type: Joi.string(),
    EUser: Joi.number().allow(''),
    EDevice: Joi.string().allow(''),
});

const purchaseAdd = async (req, res) => {
    const validation = validationMiddleware(PurchaseSchemaJOI);
    await new Promise((resolve, reject) => {
        validation(req, res, () => {
            resolve();
        });
    });
    const {
        PurchaseId,
        BillNo,
        PartyId: PartyId,
        PaymentTerms,
        DueDate = '',
        Status,
        StateOfSupply = "",
        TotalAmount,
        Discount,
        ShippingCharge,
        ShippingTax,
        NetTotalAmount,
        PaymentTypeId = 0,
        PaymentType = '',
        PaidAmount,
        Balance,
        Type,
        EUser,
        EDevice,
        SubData = []
    } = req.body;
    
    try {
        const Username = req.Username;
        const userDbConnection = getUserDatabaseConnection(Username);
        const State = userDbConnection.model('State', StateSchema);
        const Party = userDbConnection.model('Party', PartySchema);
        const GST = userDbConnection.model('GST', GSTSchema);
        const Item = userDbConnection.model('Item', ItemSchema);
        const PaymentMethod = userDbConnection.model('PaymentMethod', PayMethodSchema);
        const Purchase = userDbConnection.model('Purchase', PurchaseSchema);
    
        const party = await Party.findOne({ PartyId }).exec();
        if (!party) {
            return res.status(201).json({ status: 0, message: 'Party Id not found' });
        }
        const paymethod = await PaymentMethod.findOne({ Id: PaymentTypeId }).exec();
        if (!paymethod) {
            return res.status(201).json({ status: 0, message: 'Payment type not found' });
        }
        if (!Array.isArray(SubData) || SubData.length === 0) {
            return res.status(201).json({ status: 0, message: 'SubData is required and should be an array' });
        }

        for (const subData of SubData) {
            const { ItemId, ItemName, Pcs, BuyRate, BuyDiscPer, WholesaleRate, WholesaleDisPer, GSTPer, TotalAmount, Discount, NetAmount } = subData;

            if (typeof ItemId === 'undefined' || typeof Pcs === 'undefined' || typeof BuyRate === 'undefined') {
                return res.status(201).json({ status: 0, message: 'ItemId, Pcs, and BuyRate are required for each SubData item' });
            }

            // Fetch item data by ItemId
            const item = await Item.findOne({ ItemCode: ItemId }).exec();
            if (!item) {
                return res.status(201).json({ status: 0, message: `Item with ItemId ${ItemId} not found` });
            }

            if (item.Pcs < Pcs) {
                return res.status(201).json({ status: 0, message: `Not enough stock for ItemId ${ItemId}` });
            }
            item.Pcs -= Pcs;
            await item.save();
            subData.ItemName = item.ItemName;

            const gst = await GST.find().exec();
            if (!gst) {
                return res.status(201).json({ status: 0, message: `GST percentage not found for GSTPer: ${GSTPer}` });
            }
        }

        let existingPurchase = await Purchase.findOne({ PurchaseId });

        if(existingPurchase){
            existingPurchase.PaymentTerms = PaymentTerms || existingPurchase.PaymentTerms;
            existingPurchase.DueDate = DueDate || existingPurchase.DueDate;
            existingPurchase.BillDate = BillDate || existingPurchase.BillDate;
            existingPurchase.Status = Status || existingPurchase.Status;
            existingPurchase.StateOfSupply = StateOfSupply || existingPurchase.StateOfSupply;
            existingPurchase.TotalAmount = TotalAmount || existingPurchase.TotalAmount
            existingPurchase.Discount = Discount || existingPurchase.Discount;
            existingPurchase.ShippingCharge = ShippingCharge || existingPurchase.ShippingCharge;
            existingPurchase.ShippingTax = ShippingTax || existingPurchase.ShippingTax;
            existingPurchase.NetTotalAmount = NetTotalAmount || existingPurchase.NetTotalAmount;
            existingPurchase.PaymentTypeId = PaymentTypeId || existingPurchase.PaymentTypeId;
            existingPurchase.PaymentType = paymethod ? paymethod.PaymentType : existingPurchase.PaymentType;
            existingPurchase.SubData = SubData.length > 0 ? SubData : existingPurchase.SubData;
            await existingPurchase.save();
            return res.status(200).json({ status: 1, message: "Updated successfully!" });
        }
        const newPurchase = new Purchase({
            BillNo,
            PartyId: party.PartyId,
            PartyName: party.PartyName,
            PaymentTerms,
            DueDate,
            StateOfSupply,
            TotalAmount,
            Discount,
            ShippingCharge,
            ShippingTax,
            NetTotalAmount,
            PaymentTypeId: paymethod.Id,
            PaymentType: paymethod.PaymentType,
            PaidAmount,
            Balance,
            Status,
            Type,
            EUser,
            EDevice,
            SubData
        });
        const savedPurchase = await newPurchase.save();
        res.status(200).json({ status: 1, message: "Done !" });
    } catch (error) {
        console.error('Error in PurchaseAdd:', error);
        res.status(201).json({ status: 0, message: error.message });
    }
};

const getPurchase = async (req, res) => {
    try {
        const { PurchaseId, page, size, search, Type, startDate, endDate } = req.body;
        const Username = req.Username;
        const userDbConnection = getUserDatabaseConnection(Username);
        const Purchase = userDbConnection.model('Purchase', PurchaseSchema);
        const currentPageNo = Number(page) || 1;
        const pageSize = Number(size) || 10;
        if (isNaN(currentPageNo) || isNaN(pageSize)) {
            throw new Error('Invalid page or size parameter');
        }

        let PurshaseQuery = {};
        if (PurchaseId !== 0) {
            PurshaseQuery.PurchaseId = PurchaseId;
        }
        if (search) {
            PurshaseQuery.$or = [
                { PartyName: new RegExp(search, 'i') },
            ];
        }
        const totalPurchase = await Purchase.countDocuments(PurshaseQuery);
        const totalPages = Math.ceil(totalPurchase / pageSize);
        const skip = (page - 1) * pageSize;
        const mysort = {PurchaseId};
        let totalBalance = 0;
        let purchases;

        if (PurchaseId === 0) {
            purchases = await Purchase.find(query)
                .skip(skip)
                .sort(mysort)
                .limit(pageSize)
                .select(' -_id -__v');
            totalBalance = purchases.reduce((acc, purchase) => acc + (parseFloat(purchase.Balance) || 0), 0);
        } else {
            purchases = await Purchase.findOne({ PurchaseId }).select(' -_id').populate('subdata.ItemId', '-_id -subdata');
            totalBalance = parseFloat(purchases?.Balance) || 0;
        }
        const pageRange = `${skip + 1}-${Math.min(skip + pageSize, totalPurchase)}`;
        res.json(formatResponsewithPage(1, 'Done!',
            totalPurchase,
            pageSize,
            currentPageNo,
            totalPages,
            pageRange,
            totalBalance,
            purchases
        ));
    } catch (error) {
        console.error('Error retrieving Purchase data:', error);
        res.status(201).json(formatResponsewithPage(0, 'Server error'));
    }
};

const deletePurchase = async (req, res) => {
    try {
        const Username = req.Username;
        const userDbConnection = getUserDatabaseConnection(Username);
        const Purchase = userDbConnection.model('Purchase', PurchaseSchema);
        const { PurchaseId } = req.body;
        const deletedPurchase = await Purchase.findOneAndDelete({ PurchaseId });
        if (!deletedPurchase)
            return res.status(201).json({ status: 0, message: 'Purchase not found' });
        res.status(200).json({ message: 'Purchase deleted' });
    } catch (error) {
        res.status(201).json({status: 0, message: error.message });
    }
};

module.exports = {
    purchaseAdd,
    getPurchase,
    deletePurchase,
};