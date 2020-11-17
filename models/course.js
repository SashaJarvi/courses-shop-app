const {Schema, model} = require('mongoose');

/* Создаем схему */
const courseSchema = new Schema({
    /* описывам поля с указанием типа данных */
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    img: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

courseSchema.method('toClient', function () {
    const course = this.toObject(); /* получаем объект курса */

    course.id = course._id;
    delete course._id;

    return course
});

/* регистрируем модель - первым параметром служит название модели, вторым - схема */
module.exports = model('Course', courseSchema);
