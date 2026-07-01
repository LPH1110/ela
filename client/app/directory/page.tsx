import { OnboardingModal } from "@/components/modals";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EmployeeTable, { Employee } from "@/components/directory/employee-table";

const employees: Employee[] = [
    {
        id: "EMP-0012",
        name: "Alex Rivera",
        email: "alex.rivera@kinetic.ela",
        department: "Product",
        status: "Active",
        avatarUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAU9p1bNfXDTEcBmvjClUEZshWy8o0XR4CBBz5U3ylSxWgANhfem8cH-E3MgShePICjguOMYL1vBrUd2Ot0FtX0pXc2YV7-DAo4jLbVsFVKFZScM9pfrbvromutqYL7bcRUqmup2h0eKVmWtNB38Ff63rPuVq8x51eatZkRX6Hn-Bl7o4gUcBirxAtmsvee-RaTBdOeC5RQ38Dr9DDQBHBRHmh-fCXXdTkRP6lKWRxAHmSF2YYCYCs-FszPpjoDKsbmX0lPXIHi403i",
    },
    {
        id: "EMP-0045",
        name: "Sarah Chen",
        email: "sarah.chen@kinetic.ela",
        department: "Engineering",
        status: "Onboarding",
        initials: "SC",
    },
    {
        id: "EMP-0008",
        name: "James Wilson",
        email: "j.wilson@kinetic.ela",
        department: "Sales",
        status: "Offboarded",
        avatarUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBO8qu1O5RxkqGSYNMDQvaauhpT3MoMn8Ru_Io_IFwxx2qXVsiRDQ6JmPMcvdgkvjL2LLMhbs72eBLsN8B9hzFjfoOjiAQBdnIp7yYsXFdyE1e7jgsu9Gx40QuY2JD9vvUrGr9TghFQW7szcWSLWWtfeYQy0IXrlcRO-wnZKrVbhVySzscyY8wfPet-p79_0M3wMnHcojFGzkhQ6pcmVA6EU8TPc8Odcz5qdJ-9frP4JlsBq0EcCR71-vA7K2avL_HOgnooXserChXv",
    },
];

export default function EmployeeDirectoryPage() {
    return (
        <div className="space-y-6">
            {/* Page Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                        Employee Directory
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage personnel, status, and lifecycle events.
                    </p>
                </div>
                <OnboardingModal>
                    <Button className="flex items-center gap-2 px-5 py-5 rounded-lg shadow-sm">
                        <Plus size={18} />
                        Add New Employee
                    </Button>
                </OnboardingModal>
            </div>

            <EmployeeTable initialEmployees={employees} />
        </div>
    );
}