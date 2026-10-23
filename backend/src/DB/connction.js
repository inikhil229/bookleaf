export async function connectDb(url) {
    try {
        return await mongoose.connect(url)
    } catch (error) {
        console.log(error)
    }
}