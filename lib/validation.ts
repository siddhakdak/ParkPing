import {z} from "zod";

export const vehicleSchema=z.object({
 vehicle_type:z.enum(["Car","Bike","EV","Commercial vehicle","Other"]),
 brand:z.string().trim().max(80).optional().or(z.literal("")),
 model:z.string().trim().max(80).optional().or(z.literal("")),
 registration_number:z.string().trim().min(2).max(30),
 nickname:z.string().trim().max(80).optional().or(z.literal(""))
});
export const messageSchema=z.object({message:z.string().trim().min(1).max(500)});
export const reportSchema=z.object({reason:z.string().min(2).max(80),description:z.string().max(500).optional()});
export const pushSchema=z.object({endpoint:z.string().url(),p256dh:z.string().min(20),auth:z.string().min(10)});
