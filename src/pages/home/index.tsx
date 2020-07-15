import React, { useState, ReactNode } from 'react'
import { BsFillPlusCircleFill } from 'react-icons/bs'
import { GrSearch } from 'react-icons/gr'
import { Table, Tag, Space } from 'antd';

import Form from '../../components/crud/Form'
import { useTheme } from '../../store'
import './styles.scss'
import { number } from 'prop-types';

interface FormSettings {
    inputs: {
        name: string
        label: string
        type: string
        inputType?: string
        size: number
        default: string
        required: boolean
        replace?: any
    }[]
}

interface Columns {
  title: string
  dataIndex: string
  key: string
  render?: (a: any) => ReactNode
}

interface Data {
  key: string
  name: string
  age: number
  address: string
  tags?: string[]
}

const columns: Columns[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: tags => (
        <>
          {tags.map((tag: any) => {
            let color = tag.length > 5 ? 'geekblue' : 'green';
            if (tag === 'loser') {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    }
]

const data: Data[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
    tags: ['cool', 'teacher'],
  },
]

const formSettings: FormSettings = {
  inputs: [
    {
      name: 'asset',
      label: 'Asset',
      type: 'input',
      size: 6,
      default: '',
      required: true
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'input',
      size: 6,
      default: '',
      required: true
    },
    {
      name: 'value',
      label: 'Value',
      type: 'input',
      inputType: 'number',
      size: 6,
      default: '',
      required: true
    },
    {
      name: 'date',
      label: 'Date',
      type: 'input',
      size: 6,
      default: '',
      required: true
    },
  ]
}

export default function Home() {
  const [ toggleForm, setToggleForm ] = useState(false)
    
    return (
        <div className="home">
          {toggleForm ? 
            <>
                <header className="home-header">
                    <div className="add-button-wrapper">
                        <p className="title">
                            Back
                        </p>
                        <span onClick={() => setToggleForm(false)}>
                            <BsFillPlusCircleFill size={24}/>
                        </span>
                    </div>
                    <div className="filter-button">
                    <span>
                        <GrSearch size={20}/>
                    </span>
                    </div>
                </header>
                <main>
                    <Form settings={formSettings}/>
                </main>
            </>
          :
            <>
                <header className="home-header">
                    <div className="add-button-wrapper">
                        <p className="title">
                            Add
                        </p>
                        <span onClick={() => setToggleForm(true)}>
                            <BsFillPlusCircleFill size={24}/>
                        </span>
                    </div>
                    <div className="filter-button">
                    <span>
                        <GrSearch size={20}/>
                    </span>
                    </div>
                </header>
                <main className="home-main">
                    <Table columns={columns} dataSource={data} />
                </main>
            </>
          }
        </div>
    )
}