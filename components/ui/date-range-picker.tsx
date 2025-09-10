// components/ui/date-range-picker.tsx
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";

interface DateRangePickerProps {
    className?: string;
    initialDateFrom?: string;
    initialDateTo?: string;
}

export function DateRangePicker({
    className,
    initialDateFrom,
    initialDateTo,
}: DateRangePickerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize date range from props or defaults
    const [date, setDate] = React.useState<DateRange | undefined>(() => {
        if (initialDateFrom && initialDateTo) {
            return {
                from: new Date(initialDateFrom),
                to: new Date(initialDateTo),
            };
        }
        return undefined;
    });

    // Update URL when date range changes
    const onDateRangeChange = React.useCallback(
        (range: DateRange | undefined) => {
            setDate(range);

            if (range?.from && range?.to) {
                const params = new URLSearchParams(searchParams);
                params.set("startDate", format(range.from, "yyyy-MM-dd"));
                params.set("endDate", format(range.to, "yyyy-MM-dd"));
                router.push(`?${params.toString()}`);
            }
        },
        [router, searchParams]
    );

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={onDateRangeChange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
