"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SortChangelog() {
    return (
        <Select
            defaultValue="newest"
            onValueChange={(value) => {
                const url = new URL(window.location.href);
                url.searchParams.set("sort", value);
                window.location.href = url.toString();
            }}
        >
            <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
        </Select>
    );
}

export default SortChangelog;