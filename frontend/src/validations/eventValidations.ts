import * as yup from "yup";

export const eventSchema = yup.object({
    title: yup
        .string()
        .required("Event title is required")
        .min(5, "Title must be at least 5 characters")
        .max(100, "Title must be less than 100 characters"),
    description: yup
        .string()
        .required("Event description is required")
        .min(20, "Description must be at least 20 characters")
        .max(1000, "Description must be less than 1000 characters"),
    category: yup
        .string()
        .required("Please select a category"),
    startAt: yup
        .string()
        .required("Start date and time are required"),
    endAt: yup
        .string()
        .required("End date and time are required")
        .test(
            "is-after-start",
            "End time must be after start time",
            function (value) {
                const { startAt } = this.parent;
                return !startAt || !value || new Date(value) > new Date(startAt);
            }
        ),
    location: yup
        .string()
        .required("Location is required"),
});