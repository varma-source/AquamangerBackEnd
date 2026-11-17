import multer from "multer";

// Middleware for uploading the profileImg

const profileImgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/profileImg");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const profileImgMaxSize = 30 * 1024 * 1024;

export const upload_profileImg = multer({
    storage: profileImgStorage,

    fileFilter: (req, file, cb) => {
        if (
            file.originalname.match(
                /\.(png|PNG|JPG|jpg|pdf|jpeg|JPEG|tiff|TIFF|gif|GIF|bmp|BMP|eps|EPS)$/
            )
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("This file extension is not allowed"));
        }
    },

    limits: {
        fileSize: profileImgMaxSize,
    },
});



const userImgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/userImg");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const userImgMaxSize = 30 * 1024 * 1024;

export const upload_userImg = multer({
    storage: userImgStorage,
    fileFilter: (req, file, cb) => {
        if (
            file.originalname.match(
                /\.(png|PNG|JPG|jpg|pdf|jpeg|JPEG|tiff|TIFF|gif|GIF|bmp|BMP|eps|EPS|mp4|MOV|WMV|FLV|AVI|WebM)$/
            )
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("This file extension is not allowed"));
        }
    },
    limits: {
        fileSize: userImgMaxSize
    }
});



const expenseImgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/expenseImg");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const expenseImgMaxSize = 30 * 1024 * 1024;

export const upload_expenseImg = multer({
    storage: expenseImgStorage,
    fileFilter: (req, file, cb) => {
        if (
            file.originalname.match(
                /\.(png|PNG|JPG|jpg|pdf|jpeg|JPEG|tiff|TIFF|gif|GIF|bmp|BMP|eps|EPS|mp4|MOV|WMV|FLV|AVI|WebM)$/
            )
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("This file extension is not allowed"));
        }
    },
    limits: {
        fileSize: expenseImgMaxSize
    }
});


const staffexpenseImgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/staffexpenseImg");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const staffexpenseImgMaxSize = 30 * 1024 * 1024;

export const upload_staffexpenseImg = multer({
    storage: staffexpenseImgStorage,
    fileFilter: (req, file, cb) => {
        if (
            file.originalname.match(
                /\.(png|PNG|JPG|jpg|pdf|jpeg|JPEG|tiff|TIFF|gif|GIF|bmp|BMP|eps|EPS|mp4|MOV|WMV|FLV|AVI|WebM)$/
            )
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("This file extension is not allowed"));
        }
    },
    limits: {
        fileSize: staffexpenseImgMaxSize
    }
});


const superadminstaffImgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/superadminstaffImg");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const superadminstaffImgMaxSize = 30 * 1024 * 1024;

export const upload_superadminstaffImg = multer({
    storage: superadminstaffImgStorage,
    fileFilter: (req, file, cb) => {
        if (
            file.originalname.match(
                /\.(png|PNG|JPG|jpg|pdf|jpeg|JPEG|tiff|TIFF|gif|GIF|bmp|BMP|eps|EPS|mp4|MOV|WMV|FLV|AVI|WebM)$/
            )
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("This file extension is not allowed"));
        }
    },
    limits: {
        fileSize: superadminstaffImgMaxSize
    }
});