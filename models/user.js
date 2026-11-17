import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            trim: true,
        },

        phone: {
            type: String,
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        image: {
            type: String,
            trim: true
        },

        password: {
            type: String,
            trim: true
        },

        farmName: {
            type: String,
            trim: true
        },

        farmLocation: {
            type: String,
            trim: true
        },

        currency: {
            type: String,
            trim: true
        },

        location: {
            type: {
                type: String,
                enum: ['Polygon'],
                required: true,
                default: 'Polygon'
            },
            coordinates: {
                type: [
                    [
                        [Number]
                    ]
                ],
                required: true
            }
        },
        role: {
            type: String,
            enum: ["owner", ],
            default: "owner",
        },
        logCreatedDate: {
            type: String,
            trim: true
        },

        logModifiedDate: {
            type: String,
            trim: true
        },
        fcmToken: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        // farmArray: [{
        //         farmName: {
        //             type: String,
        //             trim: true
        //         },



        //         farmLocation: {
        //             type: String,
        //             trim: true
        //         },

        //         currency: {
        //             type: String,
        //             trim: true
        //         },

        //         location: {
        //             type: {
        //                 type: String,
        //                 enum: ["Polygon"],
        //                 required: true,
        //                 default: "Polygon"
        //             },
        //             coordinates: {
        //                 type: [
        //                     [
        //                         [Number]
        //                     ]
        //                 ],
        //                 required: true
        //             }
        //         }
        //     }


        // ]

    }, {
        timestamps: true
    }


);

// GeoJSON 2dsphere index
staffSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', staffSchema);

export default User;