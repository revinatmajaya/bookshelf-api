const { nanoid } = require('nanoid')

const bookshelf = require('./bookshelf')

const addBookHandler = (request, h) => {
    // check if client didn't include the name of the book
    if (request.payload.name === undefined) {
        return h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
        })
        .code(400)
    }

    const {
        name, year, author, summary,
        publisher, pageCount, readPage, reading
    } = request.payload

    // check if client readPage is more than pageCount
    if (readPage > pageCount) {
        return h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        })
        .code(400)
    }

    const id = nanoid(16)
    const finished = readPage === pageCount
    const insertedAt = new Date().toISOString()
    const updatedAt = insertedAt

    const newNote = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt
    }

    bookshelf.push(newNote)

    const isSuccess = bookshelf.filter(bookshelf => bookshelf.id === id).length > 0

    if (isSuccess) {
        return h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id
            }
        })
        .code(201)
    }

    return h.response({
        status: 'error',
        message: 'Buku gagal ditambahkan'
    })
    .code(500)
}

const getAllBooksHandler = (request) => {
    const { name, reading, finished } = request.query

    let books = bookshelf // initial value

    // check name query
    if (name) {
        books = books.filter(book => book.name.toLowerCase().includes(name.toLowerCase())) // ignore case sensitive
    }

    // check reading query
    if (reading === '1' || reading === '0') {
        reading === '1'
        ? books = books.filter(book => book.reading === true)
        : books = books.filter(book => book.reading === false)
    }

    // check finished query
    if (finished === '1' || finished === '0') {
        finished === '1'
        ? books = books.filter(book => book.finished === true)
        : books = books.filter(book => book.finished === false)
    }

    books = books.map(book => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher
    }))

    return {
        status: 'success',
        data: { books }
    }
}

const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params

    const book = bookshelf.filter(book => book.id === bookId)[0]

    if (book !== undefined) {
        return {
            status: 'success',
            data: { book }
        }
    }

    return h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan'
    })
    .code(404)
}

const editBookByIdHandler = (request, h) => {
    // check if client didn't include the name of the book
    if (request.payload.name === undefined) {
        return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        })
        .code(400)
    }

    const { bookId } = request.params

    const {
        name, year, author, summary,
        publisher, pageCount, readPage, reading
    } = request.payload

    // check if client readPage is more than pageCount
    if (readPage > pageCount) {
        return h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
        })
        .code(400)
    }

    const updatedAt = new Date().toISOString()

    const index = bookshelf.findIndex(book => book.id === bookId)

    if (index !== -1) {
        bookshelf[index] = {
            ...bookshelf[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt
        }
        return {
            status: 'success',
            message: 'Buku berhasil diperbarui'
        }
    }

    return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan'
    })
    .code(404)
}

const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params

    const index = bookshelf.findIndex(book => book.id === bookId)

    if (index !== -1) {
        bookshelf.splice(index, 1)
        return {
            status: 'success',
            message: 'Buku berhasil dihapus'
        }
    }

    return h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan'
    })
    .code(404)
}

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
}
