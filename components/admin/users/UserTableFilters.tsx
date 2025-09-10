// components/admin/users/UserTableFilters.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const filterSchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.string().optional(),
  filterField: z.string().optional(),
  filterValue: z.string().optional(),
  filterOperator: z.string().optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export default function UserTableFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      searchValue: searchParams.get("searchValue") || "",
      searchField: searchParams.get("searchField") || "name",
      filterField: searchParams.get("filterField") || "",
      filterValue: searchParams.get("filterValue") || "",
      filterOperator: searchParams.get("filterOperator") || "eq",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortDirection: (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
    },
  });
  
  const applyFilters = (values: FilterValues) => {
    const params = new URLSearchParams();
    
    if (values.searchValue) {
      params.set("searchValue", values.searchValue);
      params.set("searchField", values.searchField || "name");
      params.set("searchOperator", "contains");
    }
    
    if (values.filterField && values.filterValue) {
      params.set("filterField", values.filterField);
      params.set("filterValue", values.filterValue);
      params.set("filterOperator", values.filterOperator || "eq");
    }
    
    if (values.sortBy) {
      params.set("sortBy", values.sortBy);
      params.set("sortDirection", values.sortDirection || "desc");
    }
    
    router.push(`/admin/users?${params.toString()}`);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getValues();
    applyFilters(values);
  };
  
  const clearFilters = () => {
    form.reset({
      searchValue: "",
      searchField: "name",
      filterField: "",
      filterValue: "",
      filterOperator: "eq",
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    router.push("/admin/users");
  };
  
  const hasActiveFilters = () => {
    const values = form.getValues();
    return !!(values.searchValue || (values.filterField && values.filterValue));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={form.watch("searchValue")}
              onChange={(e) => form.setValue("searchValue", e.target.value)}
            />
          </div>
          
          <Select
            value={form.watch("searchField")}
            onValueChange={(val) => form.setValue("searchField", val)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="role">Role</SelectItem>
            </SelectContent>
          </Select>
          
          <Button type="submit">Search</Button>
        </form>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px]" align="end">
            <Form {...form}>
              <div className="space-y-4">
                <h4 className="font-medium">Filter Options</h4>
                <Separator />
                
                <FormField
                  control={form.control}
                  name="filterField"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filter By</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="role">Role</SelectItem>
                          <SelectItem value="banned">Ban Status</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                {form.watch("filterField") && (
                  <>
                    <FormField
                      control={form.control}
                      name="filterOperator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operator</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || "eq"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="eq">Equals</SelectItem>
                              <SelectItem value="neq">Not Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="filterValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          {form.watch("filterField") === "role" ? (
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : form.watch("filterField") === "banned" ? (
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Banned</SelectItem>
                                <SelectItem value="false">Active</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl>
                              <Input {...field} placeholder="Filter value" />
                            </FormControl>
                          )}
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                <Separator />
                
                <FormField
                  control={form.control}
                  name="sortBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort By</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || "createdAt"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="role">Role</SelectItem>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sortDirection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Direction</FormLabel>
                      <Select 
                        onValueChange={field.onChange as (value: string) => void} 
                        defaultValue={field.value || "desc"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={clearFilters}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      applyFilters(form.getValues());
                      setShowFilters(false);
                    }}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Form>
          </PopoverContent>
        </Popover>
        
        {hasActiveFilters() && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-10"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Sort:</span>
          <span className="font-medium">
            {form.watch("sortBy") || "Created Date"}
          </span>
          <ArrowUpDown className="h-3 w-3" />
          <span>
            {form.watch("sortDirection") === "asc" ? "Ascending" : "Descending"}
          </span>
        </div>
      </div>
    </div>
  );
}
