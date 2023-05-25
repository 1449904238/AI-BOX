import { appConfigDir } from '@tauri-apps/api/path'
import Database from 'tauri-plugin-sql-api'
import type {
  TableName,
  TablePayload,
  WherePayload,
  RolePayload
} from '@/types'

const dbFile = import.meta.env.DEV ? 'sql.dev.db' : 'sql.db'
const db = await Database.load(`sqlite:${await appConfigDir()}${dbFile}`)

/**
 * sql 的字符串参数需要在加一个冒号
 * @param value 参数
 */
const getValue = (value: any) =>
  isString(value) ? `'${value.replaceAll("'", '&#39;')}'` : value

/**
 * 执行 sql 语句
 * @param sql sql 语句
 */
export const executeSQL = async (sql: string, hideError = false) => {
  const sliceSQL = sql.slice(0, 6)

  try {
    if (sliceSQL === 'SELECT') {
      return await db.select(sql)
    } else {
      await db.execute(sql)
    }
  } catch (error) {
    if (hideError) return

    let action

    switch (sliceSQL) {
      case 'SELECT':
        action = '获取'
        break

      case 'INSERT':
        action = '添加'
        break

      case 'UPDATE':
        action = '更新'
        break

      case 'DELETE':
        action = '删除'
        break

      default:
        action = '创建'
        break
    }

    Message.error(`${action}数据时遇到了问题，请稍后重试！`)
  }
}

/**
 * 初始化 sql 配置
 */
export const initSQL = async () => {
  await executeSQL(
    `
    CREATE TABLE IF NOT EXISTS session (id TEXT, title TEXT, role_id INTEGER, type TEXT, update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS session_data (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, message TEXT, is_ask INTEGER, is_memory INTEGER, message_type TEXT, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS role (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, is_default INTEGER DEFAULT false);
    CREATE TABLE IF NOT EXISTS credit (id INTEGER PRIMARY KEY AUTOINCREMENT, history_id INTEGER, token_cost INTEGER, api_key TEXT);
    `
  )
  // for (let i = 2; i++; i <= 218) {
  //   deleteSQL('role', i)
  // }
  /*
    TODO 设置成英语并重启后，可能会新建一个无法删除的默认角色？
    解决方案：若切换语言时，修改原默认角色在数据库中的默认配置
  */
  // await insertSQL('role', {
  //   name: DEFAULT_ROLE.name,
  //   description: DEFAULT_ROLE.description,
  //   is_default: true
  // })
  const roleList = [
    {
      name: '编剧',
      description:
        '我要你当编剧。您将为一部长篇电影或可以吸引观众的网络系列开发引人入胜且富有创意的脚本。首先想出有趣的角色，故事的设置，角色之间的对话等。一旦你的角色发展完成 - 创建一个令人兴奋的故事情节，充满曲折，让观众保持悬念，直到最后。'
    },
    {
      name: '小说家',
      description:
        '我想让你扮演一个小说家。您将提出富有创意和引人入胜的故事，可以长时间吸引读者。您可以选择任何类型，例如幻想，浪漫，历史小说等 - 但目的是写一些具有出色情节，引人入胜的角色和意想不到的高潮的东西。'
    },
    {
      id: 4,
      name: 'IT专家',
      description:
        '我希望你担任 IT 专家。我将为您提供有关我的技术问题所需的所有信息，您的角色是解决我的问题。你应该使用你的计算机科学，网络基础设施和IT安全知识来解决我的问题。在您的答案中为各个级别的人使用智能、简单和易于理解的语言会有所帮助。逐步解释您的解决方案并带有要点很有帮助。尽量避免太多技术细节，但在必要时使用它们。我希望你回复解决方案，而不是写任何解释。'
    },
    {
      id: 5,
      name: 'Midjourney Prompt',
      description:
        '我想让你充当Midjourney人工智能程序的提示生成器。你的工作是提供详细和有创意的描述，以激发人工智能的独特和有趣的图像。请记住，人工智能能够理解广泛的语言，并能解释抽象的概念，所以请自由发挥想象力和描述力，尽可能地发挥。例如，你可以描述一个未来城市的场景，或一个充满奇怪生物的超现实景观。你的描述越详细、越有想象力，产生的图像就越有趣。'
    },
    {
      id: 6,
      name: '正则表达式',
      description:
        '我希望你充当正则表达式生成器。您的角色是生成与文本中的特定模式匹配的正则表达式。您应该以可以轻松复制并粘贴到启用正则表达式的文本编辑器或编程语言中的格式提供正则表达式。不要写正则表达式如何工作的解释或示例;只需仅提供正则表达式本身。'
    },
    {
      id: 7,
      name: 'vue前端开发',
      description:
        '我希望你担任高级前端开发人员。我将描述一个项目细节，你将使用这个工具对项目进行编码：Create Vue App, yarn|npm, Ant Vue Design, axios。您应该将文件合并到单个索引中.js文件，而不是其他任何内容。不要写解释。'
    },
    {
      id: 8,
      name: 'React前端开发',
      description:
        '我希望你担任高级前端开发人员。我将描述一个项目细节，你将使用这个工具对项目进行编码：Create React App, yarn|npm, Ant Design, axios。您应该将文件合并到单个索引中.js文件，而不是其他任何内容。不要写解释。'
    },
    {
      id: 9,
      name: 'Flutter前端开发',
      description:
        '我希望你担任高级前端开发人员。我将描述一个项目细节，你将使用这个工具对项目进行编码：Create Flutter App。您应该将文件合并到单个索引中.js文件，而不是其他任何内容。不要写解释。'
    },
    {
      id: 10,
      name: 'UX / UI开发人员',
      description:
        '我希望你扮演UX / UI开发人员。我将提供有关应用程序，网站或其他数字产品设计的一些详细信息，您的工作将是提出创造性的方法来改善其用户体验。这可能涉及创建原型原型，测试不同的设计，并就最有效的方法提供反馈。'
    },
    {
      id: 11,
      name: '同义词',
      description:
        '我希望你能充当同义词提供者。我将告诉你一个词，你将根据我的提示，给我提供一份同义词备选清单。每个提示最多可提供10个同义词。如果我想获得更多的同义词，我会用一句话来回答："更多的x"，其中x是你寻找的同义词的单词。你将只回复单词列表，而不是其他。词语应该存在。不要写解释。'
    },
    {
      id: 12,
      name: '医生',
      description:
        '我希望你扮演一个虚拟医生。我将描述我的症状，您将提供诊断和治疗计划。您应该只回复您的诊断和治疗计划，而不应回复其他任何内容。'
    },
    {
      id: 13,
      name: '厨师',
      description:
        '我需要有人可以推荐美味的食谱，其中包括营养有益但又简单且不够耗时的食物，因此适合像我们这样的忙碌的人以及其他因素，例如成本效益，因此整体菜肴最终既健康又经济同时！'
    },
    {
      id: 14,
      name: '格言书',
      description:
        '我要你充当格言书。您将为我提供明智的建议，鼓舞人心的名言和有意义的谚语，以帮助指导我的日常决策。此外，如有必要，您可以提出将这些建议付诸行动或其他相关主题的实用方法。'
    },
    {
      id: 15,
      name: '自助书',
      description:
        '我希望你充当一本自助书。您将为我提供有关如何改善我生活某些领域的建议和技巧，例如人际关系、职业发展或财务规划。例如，如果我在与另一半的关系中挣扎，你可以建议一些有用的沟通技巧，让我们更紧密地联系在一起。'
    },
    {
      id: 16,
      name: 'DIY专家',
      description:
        '我希望你扮演一个DIY专家。您将培养完成简单的家庭装修项目所需的技能，为初学者创建教程和指南，使用视觉效果用通俗的语言解释复杂的概念，并致力于开发有用的资源，人们在自己动手时可以使用。'
    },
    {
      id: 17,
      name: '汽车导航系统',
      description:
        '我希望你充当汽车导航系统。您将开发用于计算从一个位置到另一个位置的最佳路线的算法，能够提供有关交通状况的详细更新，考虑施工绕道和其他延误，利用谷歌地图或苹果地图等地图技术，以提供沿途不同目的地和兴趣点的交互式视觉效果。'
    },
    {
      name: '默认角色', // DEFAULT_ROLE.name,
      description: '请以 markdown 的形式返回答案！', //DEFAULT_ROLE.description,
      is_default: true
    }
  ]
  
  const findDefaultRole = await selectSQL('role', [
    { key: 'is_default', value: true }
  ])
  roleList.forEach(async (res) => {
    let isAdd = true
    findDefaultRole.forEach((role) => {
      if (role.name == res.name) {
        isAdd = false
      }
    })
    if (isAdd) {
      await insertSQL('role', {
        name: res.name,
        description: res.description,
        is_default: true
      })
    }
  })

  // 发版之后的表更新操作，只能对已存在的表进行增加列，不能删除列
  // 1. 2023-03-22 在 session 表中添加 update_time 列，记录对话的最后一次更新时间
  await executeSQL(
    `ALTER TABLE session ADD COLUMN update_time TIMESTAMP DEFAULT ${Date.now()};`,
    true
  )
  // 2. 2023-03-27 在 session 表中添加 type 列，记录对话的类型
  await executeSQL(
    `ALTER TABLE session ADD COLUMN type TEXT DEFAULT 'text';`,
    true
  )
}

/**
 * 查找的 sql 语句
 * @param tableName 表名称
 * @returns
 */
export const selectSQL = async (
  tableName: TableName,
  wherePayload?: WherePayload[]
) => {
  let whereCondition = ''

  if (wherePayload) {
    const newWherePayload = wherePayload.reduce((payload, { key, value }) => {
      return payload.concat(`${key}=${getValue(value)}`)
    }, [] as string[])

    whereCondition = `WHERE ${newWherePayload.join(' AND ')}`
  }

  const list = (await executeSQL(
    `SELECT * FROM ${tableName} ${whereCondition} ORDER BY id DESC;`
  )) as any[]

  for (const item of list) {
    for (const key in item) {
      if (isString(item[key])) {
        item[key] = item[key].replaceAll('&#39;', "'")
      }
    }
  }

  return list
}

/**
 * 添加的 sql 语句
 * @param tableName 表名称
 * @param payload 添加的数据
 */
export const insertSQL = async (
  tableName: TableName,
  payload: TablePayload
) => {
  // const { changeDefaultRole } = useRoleStore()
  // if (tableName === 'role' && (payload as RolePayload).is_default) {
  //   const findDefaultRole = await selectSQL('role', [
  //     { key: 'is_default', value: true }
  //   ])
  //   console.log(findDefaultRole, '==findDefaultRole')
  //   if (findDefaultRole.length) return changeDefaultRole()
  // }

  const insertKeys = [],
    insertValues = []

  for (const key in payload) {
    insertKeys.push(key)

    let value = payload[key as keyof typeof payload]

    if (isObject(value)) {
      value = JSON.stringify(value)
    }

    insertValues.push(getValue(value))
  }

  await executeSQL(
    `INSERT INTO ${tableName} (${insertKeys.join()}) VALUES (${insertValues.join()});`
  )
}

/**
 * 更新的 sql 语句
 * @param tableName 表名称
 * @param payload 修改的数据
 */
export const updateSQL = async (
  tableName: TableName,
  payload: TablePayload
) => {
  const newPayload = { ...payload }

  delete newPayload.id

  const updateParams: string[] = []

  for (const key in newPayload) {
    let value = newPayload[key as keyof typeof newPayload]

    if (isObject(value)) {
      value = JSON.stringify(value)
    }

    updateParams.push(`${key}=${getValue(value)}`)
  }

  await executeSQL(
    `UPDATE ${tableName} SET ${updateParams.join()} WHERE id=${getValue(
      payload.id
    )};`
  )
}

/**
 * 删除的 sql 语句
 * @param tableName 表名称
 * @param id 删除数据的 id
 */
export const deleteSQL = async (tableName: TableName, id?: number | string) => {
  if (id) {
    // 查找要删除的项是否还在数据库
    const findItem = await selectSQL(tableName, [{ key: 'id', value: id }])

    if (!findItem.length) {
      Message.error('删除失败，该数据不存在于数据库！')
      return
    }

    await executeSQL(`DELETE FROM ${tableName} WHERE id=${id};`)
  } else {
    await executeSQL(`DELETE FROM ${tableName};`)
  }
}
