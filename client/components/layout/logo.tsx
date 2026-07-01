import { Hexagon } from "lucide-react";

export default function Logo() {
    return <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0">
            <Hexagon size={20} />
        </div>
        <h1 className="text-lg font-bold text-primary tracking-tight leading-none">ELA</h1>
    </div>
}