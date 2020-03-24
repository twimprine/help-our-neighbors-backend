"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_base64_1 = require("js-base64");
exports.getNextToken = (lastEvaluatedKey) => {
    if (lastEvaluatedKey) {
        return js_base64_1.Base64.encode(JSON.stringify(lastEvaluatedKey));
    }
    return null;
};
exports.parseNextToken = (token) => {
    return JSON.parse(js_base64_1.Base64.decode(token));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL3BhZ2luYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5Q0FBbUM7QUFFdEIsUUFBQSxZQUFZLEdBQUcsQ0FBQyxnQkFBcUIsRUFBaUIsRUFBRTtJQUNqRSxJQUFJLGdCQUFnQixFQUFFO1FBQ2xCLE9BQU8sa0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7S0FDekQ7SUFDRCxPQUFPLElBQUksQ0FBQTtBQUNmLENBQUMsQ0FBQTtBQUVZLFFBQUEsY0FBYyxHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7SUFDNUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDM0MsQ0FBQyxDQUFBIn0=