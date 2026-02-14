import { Color } from "chess.js";

export default function InvertirColor(color:Color):Color {
    return color==="b"?"w":"b";
}