import { createClient } from "@supabase/supabase-js";

// Đây là địa chỉ nhà kho của bạn
const supabaseUrl = "https://umblgvuxvcttswevmklp.supabase.co";

// Đây là chìa khóa vạn năng bạn vừa copy
const supabaseKey = "sb_publishable_ni7HeBQGp3vpHQmTGTHPGQ_B5Hg4IvH";

export const supabase = createClient(supabaseUrl, supabaseKey);
