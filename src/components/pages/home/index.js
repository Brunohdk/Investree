import React, { useState, useEffect } from 'react'
import { Row, Col, Input, Spin } from 'antd'
import objectPath from 'object-path'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import Button from '../../../components/common/Button'
import Select from 'react-select'
import api from '../../../services/api'
import Label from '../../common/Label'
import enviroment from '../../../config/enviroment'
import './styles.scss'

export default function HomeForm({ setToggleForm, history, match }) {
    const settings= {
        module: 'investree',
        entityPath: 'operation',
        inputs: [

            {
                type: 'input',
                name: 'amount',
                label: 'Amount',
                size: 6,
                default: '',
                required: true
            },
            {
                type: 'input',
                name: 'value',
                label: 'Value',
                inputType: 'number',
                size: 6,
                default: '',
                required: true
            },
            {
                type: 'calendar',
                name: 'date',
                label: 'Date',
                size: 6,
                default: new Date(),
                required: true
            }
        ]
    }

	let formDefaultValue = {
		asset: '',
		bought: []
	}

	let subformDefaultValue = {
		amount: '',
		value: '',
		date: new Date()
	}

	const assetObjFormat = {
		name: 'asset',
		fieldKey: {
			value: 'name',
			name: 'name'
		},
		dataSource: {
			module: 'investree',
			entityPath: 'asset'
		},
	}

	const [ dataListEntities, setDataListEntities ] = useState([])
	const [ formData, setFormData ] = useState(formDefaultValue)    
	const [ subformData, setSubformData ] = useState(subformDefaultValue)
	const [ submitForm, setSubmitForm ] = useState(false)
	const [ loadingData, setLoadingData ] = useState(true)
	const [ moreThanOneOrder, setMoreThanOneOrder ] = useState(false)
	const [ loadingActionRequest, setLoadingActionRequest ] = useState(false)

    function save(data) {
		setLoadingActionRequest(true)

        const request = api.post(`${enviroment.apiURL[settings.module]}${settings.entityPath}`, data)
        
        request.then(resp => {
            clearRequest()
        })
        .catch(err => console.log(err))
    }

	function update(data) {
		setLoadingActionRequest(true)

		const request = api.put(`${enviroment.apiURL[settings.module]}${settings.entityPath}/${data._id}`, data)

		request.then(response => {
			// Notification('success', 'update')
			setLoadingActionRequest(false)
			clearRequest()
		})
		.catch(error => {
			setLoadingActionRequest(false)
			// Notification('error', error)
			console.log(error)
		})
	}

	function listUnique(id) {
		const request = api.get(`${enviroment.apiURL[settings.module]}${settings.entityPath}/${id}`)

		request.then(response => {
			const data = response.data

			setFormData(data)
			setLoadingData(false)
		})
		.catch(error => {
			// Notification('error', error)
			console.log(error)
			setLoadingData(false)
		})
	}

	function list(params) {
		const request = api.get(`${enviroment.apiURL[params.module]}${params.entityPath}?limit=1000`)
		setLoadingData(true)

		request.then(response => {
			const data = response.data
			setDataListEntities(prevState => ({...prevState, [params.entityPath]: data}))
			setLoadingData(false)
		})
		.catch(error => {
			// Notification('error', error)
			console.log(error)
			setLoadingData(false)
		})
	}

	function getData(input) {
		if(input.dataSource) {
			let inputData = dataListEntities[input.dataSource.entityPath]
			input.data = inputData

			return inputData
		} else {
			return input.data
		}
	}

	function handleSelectData(input) {
		let arr = []
		dataListEntities && dataListEntities[input.dataSource.entityPath].map(item =>
			arr.push({
				value: item[input.fieldKey.value],
				label: (input.fieldKey.name).constructor.name === 'Array' ?
						concatLabelSelect(input.fieldKey.name, item)
					:
						item[input.fieldKey.name]
			})
		)
		return arr
	}

    function handleChange(e) {
        const { name, value } = e.target

        setSubformData(prevState => ({...prevState, [name]: value}))
	}
	
	function handleformDataValidated() {
		settings.inputs.forEach(input => {
			if(input.excludeBeforePost)
				delete formData[input.name]
			if(input.replace)
				formData[input.name] = formData[input.name] && input.replace(formData[input.name])
		})
	}

	function handleSubmitSingle(e) {
		e.preventDefault()
		setSubmitForm(true)

		if(validated()) {
			setSubmitForm(false)
			formData['bought'].push(subformData)

			// handleformDataValidated()

			formData._id ?
				update(formData)
			:
				save(formData)
		}
	}

    function concatLabelSelect(field, input) {
		let arr = []
		field.map(label => {
			arr.push(objectPath.get(input, label))
		})

		return arr.join(' - ')
	}

	function validated() {
		let isValid = true

		if(formData['asset'] === '' || formData['asset'] === null)
			isValid = false

		for(let input in subformData) {
			console.log(input)
			if(subformData[input] === '' || subformData[input] === null || subformData[input].length === 0)
				isValid = false
		}

		console.log(isValid)
		console.log(subformData)

		return isValid
	}

    function selectValueConvert(input) {
		let value = subformData[input.name]

		if(value || value === false) {
			if(input.dataSource && dataListEntities[input.dataSource.entityPath]) {
				value = formData[input.name][input.fieldKey.value] || formData[input.name]

				let filteredData = dataListEntities[input.dataSource.entityPath].filter(item => item[input.fieldKey.value] === value)[0]

				return {
					label: (input.fieldKey.name).constructor.name === 'Array' ?
							concatLabelSelect(input.fieldKey.name, filteredData)
						:
							filteredData[input.fieldKey.name],
					value: filteredData[input.fieldKey.value]
				}
			} else if(!input.dataSource){
				let obj = {}

				input.data.map(item => {
					if(((input.fieldKey && item[input.fieldKey.value]) || item.value) === value) {
						obj = {
							value: value,
							label: input.fieldKey ? (input.fieldKey.name).constructor.name === 'Array' ?
										concatLabelSelect(input.fieldKey.name, item)
									:
										objectPath.get(item, input.fieldKey.name)
								:
										item.name
						}
					}
				})

				return obj
			}
		} else {
			return input.default
		}
	}

    function clearRequest() {
        setToggleForm(false)
        setFormData(formDefaultValue)
        history.push('/')
	}
	
	useEffect(() => {
			if(match.params.query)
				listUnique(match.params.query)
			
			list(assetObjFormat.dataSource)
	}, [])

    return (
		!loadingData ?
			<form 
				onSubmit={moreThanOneOrder ? {} : handleSubmitSingle}
				className="homeForm"
			>
				<Row gutter={16}>
					<Col span={6}>
						<Label text={'More than one order?'}/>
						<Select 
							name={'moreThanOneOrder'}
							classNamePrefix={'reactselect'}
							value={moreThanOneOrder ? {label: 'Yes', value: true} : {label: 'No', value: false}}
							onChange={e => setMoreThanOneOrder(e.value)}
							options={[
								{
									label: 'Yes',
									value: true
								},
								{
									label: 'No',
									value: false
								}
							]}
						/>
					</Col>
					<Col span={6}>
						<Label text={'Asset'}/>
						<Select 
							name={'asset'}
							placeholder='Select...'
							classNamePrefix={'reactselect'}
							value={selectValueConvert(assetObjFormat)}
							onChange={e => setFormData(prevState => ({...prevState, asset: e.value}))}
							options={handleSelectData(assetObjFormat)}
						/>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={4}>
						<Label text={'Value'} />
						<Input 
							type="text"
							name={'value'}
							required={true}
							value={subformData['value'] || ''}
							onChange={handleChange}
						/>
					</Col>
					<Col span={4}>
						<Label text={'Amount'} />
						<Input 
							type="text"
							name={'amount'}
							required={true}
							value={subformData['amount'] || ''}
							onChange={handleChange}
						/>
					</Col>
					<Col span={4}>
						<Label text={'Date'}/>
						<DatePicker 
							dateFormat='dd/MM/yyyy'
							selected={new Date(subformData['date']) || ''}
							onChange={date => setSubformData(prevState => ({...prevState, date}))}
						/>
					</Col>
					{moreThanOneOrder &&
						<Button 
							title='+'
							size='small'
							onClick={e => {}}
						/>
					}
				</Row>
				<div className="homeForm__btnGroup">
					{loadingActionRequest ?
						<Button 
							className="homeForm__btnGroup--loadingBtn"
							disabled
							outline
							icon={() => <Spin /> }
						/>
					:
						<Button 
							title='Save'
							size='small'
							onClick={e => handleSubmitSingle(e)}
						/>
					}
					<Button 
						title='Cancel'
						size='small'
						link
						onClick={() => clearRequest()}
					/>
				</div>
			</form>
		:
			<div className="l">
				LOADING
			</div>
    )  
}