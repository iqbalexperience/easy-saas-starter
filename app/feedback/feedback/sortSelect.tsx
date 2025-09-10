"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SortSelect({ sort }: { sort: string | undefined }) {
    return (<Select
        defaultValue={sort || "newest"}
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
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most-upvotes">Most Upvotes</SelectItem>
            <SelectItem value="least-upvotes">Least Upvotes</SelectItem>
        </SelectContent>
    </Select>);
}

export default SortSelect;