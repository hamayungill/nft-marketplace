import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeIngredient, getIngredients, upsertIngredient, deleteIngredient, getIngredient } from './Ingredients.action';
import { getCategories } from '../Categories/Categories.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import $ from 'jquery';
import { Button, Form, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import { _upsertIngredient } from '../../utils/web3';

const Ingredient = (props) => {
    const [submissionType, setSubmissionType] = useState(1)
    const [ingredient, setIngredient] = useState({ name: '', image: '', rawImage: '', price: '', categoryId: '', isActive: true, artistAddress: '' })
    const [loader, setLoader] = useState(false)
    const [categoryOptions, setCategoryOptions] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [catTypeId, setCatTypeId] = useState(1)
    const { ingredientId } = useParams();
    const [error, setError] = useState({})

    useEffect(() => {
        window.scroll(0, 0)
        props.getCategories(1)
        if (ingredientId) {
            props.getIngredient(ingredientId)
        }
    }, [])

    useEffect(() => {
        if (props.catgories && props.catgories.length > 0) {
            let cat_arr = []
            props.catgories.map((cat) => {
                cat_arr.push({ value: cat?._id, label: cat?.name, typeId: cat?.typeId })
            })
            setCategoryOptions(cat_arr)
        }
    }, [props.catgories])

    const txFn = async (ingredientTokenURI, price, artistAddress, id, _ingredientId, categoryType, type, name, maxMints) => {
        const res = await _upsertIngredient(ingredientTokenURI, price, artistAddress, id, _ingredientId, categoryType, type, name, maxMints)
        if (res) {
            props.history.push("/ingredients")
        } else {
            setLoader(false)
        }
    }
    useEffect(() => {
        if (props?.ingredient?.success) {
            if (submissionType === 1) {
                const { image, price, artistAddress, _id: id, name, maxMints } = props.ingredient.data;
                txFn(image, price, artistAddress, id, 0, catTypeId, 1, name, maxMints)
            }
        }
    }, [props.upsertIngredientAuth])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])

    const onChange = (e) => {
        let { name, value } = e.target
        if (name === 'isActive') {
            value = !ingredient.isActive
        }
        let data = ingredient
        data[name] = value

        setIngredient({ ...data })
    }

    const onFileChange = (e) => {
        let file = e.target.files[0]
        let fileId = e.target.id
        if (file)
            if (file.type.includes('image')) {
                let data = ingredient
                data = { ...data, [e.target.name]: file }
                setIngredient(data)
                if (file) {
                    var reader = new FileReader()
                    reader.onload = function (e) {
                        $(`#category-${fileId}`).attr('src', e.target.result)
                        $('#category-image-label').html('File selected')
                    }
                    reader.readAsDataURL(file)
                }
            } else {
                // TODO
                // $(`#category-${fileId}`).attr('src', placeholderImg)
                file = {}
            }
    }

    const onFileChangeRaw = (e) => {
        let file = e.target.files[0]
        let fileId = e.target.id
        if (file)
            if (file.type.includes('image')) {
                let data = ingredient
                data = { ...data, [e.target.name]: file }
                setIngredient(data)
                if (file) {
                    var reader = new FileReader()
                    reader.onload = function (e) {
                        $(`#category-${fileId}`).attr('src', e.target.result)
                        $('#category-raw-image-label').html('File selected')
                    }
                    reader.readAsDataURL(file)
                }
            } else {
                // TODO
                // $(`#category-${fileId}`).attr('src', placeholderImg)
                file = {}
            }
    }

    const validation = () => {
        let err = {}
        let isValid = true
        if (!ingredient.name) {
            err["name"] = "Name is Required."
            isValid = false
        }
        if(ingredient.price <= 0){
            err["price"] = "Price is never less then 0"
            isValid = false
        }
        if (!ingredient.price) {
            err["price"] = "Price is Required."
            isValid = false
        }
        if (!selectedCategory) {
            err["category"] = "Category is must be Selected."
            isValid = false
        }
        if (!ingredient.image && submissionType === 1) {
            err["image"] = "Image is Required."
            isValid = false
        }
        if (!ingredient.pizzaImage && submissionType === 1) {
            err["pizzaImage"] = "Pizza Image is Required."
            isValid = false
        }
        if (!ingredient.artistAddress) {
            err["artistAddress"] = "Artist Address is Requried."
            isValid = false
        }
        if (!ingredient.maxMints) {
            err["maxMints"] = "Max Minted Number is Requried."
            isValid = false
        }
        if (!ingredient.layerNum) {
            err["layerNum"] = "Layer Number is Requried."
            isValid = false
        }
        setError(err)
        return isValid
    }

    const submit = async () => {
        if (validation()) {
            if (ingredient.name && ingredient.price && selectedCategory && ingredient.image) {
                setLoader(true)
                var formData = new FormData()
                for (const key in ingredient)
                    formData.append(key, ingredient[key])
                props.upsertIngredient(`ingredient/${submissionType === 1 ? 'create' : 'edit'}`, formData, submissionType === 1 ? 'POST' : 'PUT')
            }
        }
    }

    return (
        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Form>
                            <Form.Group className="mb-4">
                                <label className="text-white">Name<span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter name"
                                    type="text"
                                    name="name"
                                    onChange={(e) => onChange(e)}
                                    defaultValue={ingredient?.name}
                                    required
                                />
                                {error["name"] && <p className="error">{error.name}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Price<span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter Price"
                                    type="Number"
                                    name="price"
                                    min={0}
                                    onChange={(e) => onChange(e)}
                                    defaultValue={ingredient?.price}
                                    required
                                />
                                {error["price"] && <p className="error">{error.price}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Raw Image {submissionType === 1 && <span className="text-danger">*</span>}</label>
                                <div className="input-group form-group">
                                    <div className="custom-file">
                                        <input type="file" className="custom-file-input" id="category-image" accept=".png,.jpeg,.jpg" onChange={(e) => onFileChange(e)} name="image" />
                                        <label id="category-image-label" className="custom-file-label" htmlFor="image">Choose file</label>
                                    </div>
                                </div>
                                {error["image"] && <p className="error">{error.image}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Pizza Image <span className="text-danger">*</span></label>
                                <div className="input-group form-group">
                                    <div className="custom-file">
                                        <input type="file" className="custom-file-input" id="category-raw-image" accept=".png,.jpeg,.jpg" onChange={(e) => onFileChangeRaw(e)} name="pizzaImage" />
                                        <label id="category-raw-image-label" className="custom-file-label" htmlFor="pizzaImage">Choose file</label>
                                    </div>
                                </div>
                                {error["pizzaImage"] && <p className="error">{error.pizzaImage}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Category<span className="text-danger">*</span></label>
                                <Select
                                    className="react-select-custom"
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e)
                                        setCatTypeId(e.typeId)
                                        let data = ingredient
                                        data["categoryId"] = e.value
                                        setIngredient({ ...data })
                                        
                                    }}
                                    options={categoryOptions}
                                    // menuIsOpen={true}
                                />
                                {error["category"] && <p className="error">{error.category}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Artist Address<span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter Artist Address"
                                    type="text"
                                    name="artistAddress"
                                    onChange={(e) => onChange(e)}
                                    defaultValue={ingredient?.artistAddress}
                                    required
                                />
                                {error["artistAddress"] && <p className="error">{error.artistAddress}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Maximum Mints<span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter Number of Maximum mints"
                                    type="text"
                                    name="maxMints"
                                    onChange={(e) => onChange(e)}
                                    defaultValue={ingredient?.maxMints}
                                    required
                                />
                                {error["maxMints"] && <p className="error">{error.maxMints}</p>}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <label className="text-white">Layer Number<span className="text-danger">*</span></label>
                                <Form.Control
                                    placeholder="Enter Number of Layer Number"
                                    type="number"
                                    name="layerNum"
                                    onChange={(e) => onChange(e)}
                                    defaultValue={ingredient?.layerNum}
                                    required
                                />
                                {error["layerNum"] && <p className="error">{error.layerNum}</p>}
                            </Form.Group>
                            <div className="about-bt modal-footer">
                                <Button
                                    className="btn btn-close"
                                    onClick={() => props.history.push("/ingredients")}
                                // variant="link"
                                >
                                    Back
                                </Button>
                                <div className="my-bt">
                                    <Button
                                        className="btn btn-save"
                                        onClick={() => submit()}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    ingredient: state.ingredient?.ingredient,
    upsertIngredientAuth: state.ingredient?.upsertIngredientAuth,
    catgories: state.category.categories,
    error: state.error
});

export default connect(mapStateToProps, { beforeIngredient, getIngredients, upsertIngredient, deleteIngredient, getCategories, getIngredient })(Ingredient);