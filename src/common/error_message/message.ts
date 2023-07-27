import { HOT_LINE } from "../constants/constants";

export const errorMessage = {
    BALANCE_NOT_ENOUGH: "Số dư không đủ!",
    NO_LOTTERY_CART: "Không có vé trong giỏ hàng!",
    NO_ORDER: "Đơn mua hàng không tồn tại!",
    RESOLVED_ORDER: "Đơn hàng đã được xác nhận hoặc hoàn trả!",
    NOT_LOCK_ORDER: "Đơn hàng chưa được khoá!",
    NOT_PRINT_ORDER: "Các vé trong đơn hàng chưa được in hết!",

    EXISTED_DRAW: "Mã kỳ quay đã tồn tại!",
    NOT_EXISTED_DRAW: "Mã kỳ quay không tồn tại!",
    UPDATED_DRAW: "Kỳ quay này đã được cập nhật kết quả!",

    MONEY_DEVIDE_1000: "Số tiền phải là bội của 1000",
    USER_NOT_FOUND: "Người dùng không tồn tại!",
    WRONG_DEVICE: "Tài khoản đã được đăng nhập ở thiết bị khác",

    NOT_FOUND: "Bản ghi không tồn tại",
    UNAUTHORIZED: "Không thể có quyền",

    WRONG_AUTH: "Số điện thoại hoặc mật khẩu không chính xác!",
    WRONG_PASS: "Mật khẩu không chính xác!",
    USER_EXISTED: "Số điện thoại này đã được đăng ký!",
    INVALID_PHONENUMBER: "Số điện thoại không hợp lệ!",

    DEVICE_NOT_FOUND: "Thiết bị không tồn tại!",

    UNABLE_UPDATE_LOTTERY: "Không thể cập nhật vé số!",
    LOTTERY_NOT_EXIST: "Vé sổ xố không tồn tại!",

    EMPTY_PASS: 'Bạn chưa nhập mật khẩu',

    BLOCKED_ACCOUNT: `Tài khoản phone hiện đang bị khoá, liên hệ ${HOT_LINE} để được hỗ trợ.`,

    EXP_OTP: "OTP này đã hết hạn!",
    INVALID_OTP: "OTP không chính xác!",
    EXP_SESSION: "Phiên xác thực hết hạn!",
    INVALID_SESSION: "Phiên xác thực không hợp lệ"
}