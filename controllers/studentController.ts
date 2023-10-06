import catchAsyncError from "../middlewares/catchAsyncError";
import balanceModel from "../models/balanceModel";
import studenModel from "../models/studenModel";
import ErrorHandler from "../utlis/errorHandler";

export const getAllStudents = catchAsyncError(async (req, res, next) => {
  const students = await studenModel.find().select("-loanReturned");
  if (!students) {
    return next(new ErrorHandler("no student found", 404));
  }
  res.status(200).json({
    success: true,
    students,
  });
});

export const grantStudentDonation = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    department,
    smester,
    section,
    reason,
    fatherName,
    fatherOcuupation,
    fatherPhone,
    financialNeed,
    financialType,
  } = req.body;
  
  const missingFields = [];

  for (const field in req.body) {
    if (!req.body[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return next(
      new ErrorHandler(`Missing fields: ${missingFields.join(", ")}`, 400)
    );
  }

  const balance = await balanceModel.findOne({});
  if (balance?.totalBalance && balance?.totalBalance > financialNeed) {
    balance.totalBalance -= financialNeed
    await balance.save()
    const newstudent = await studenModel.create({
      name,
      email,
      department,
      smester,
      section,
      reason,
      fatherName,
      fatherOcuupation,
      fatherPhone,
      financialNeed,
      financialType,
    });
    res.status(200).json({
      succes: true,
      message: "donation granted successfully",
      newstudent,
    });
  } else {
    return next(
      new ErrorHandler(
        `not sufficient balance. current balance is ${
          balance?.totalBalance ? balance?.totalBalance : 0
        }`,
        403
      )
    );
  }
});
